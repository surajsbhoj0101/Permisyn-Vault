import express from "express";
import request from "supertest";
import { checkAuth, getNonce, checkUsernameTaken,setRoleSelection, checkEmailTaken, requestOtp, verifyOtp } from "../../src/controllers/auth.controller";
import * as authUtils from "../../src/middlewares/requireAuth";
import * as rateLimit from "../../src/middlewares/otpRequest.middleware"
import * as mail from "../../src/services/sendMail"
import redis from "../../src/config/redis";
import { prisma } from "../../src/config/db";
import { verify } from "node:crypto";
const app = express();
app.use(express.json());
app.get("/check-auth", checkAuth);
app.get("/get-nonce", getNonce);
app.get("/check-username/:username", checkUsernameTaken);
app.get("/check-email/:email", checkEmailTaken);
app.post(
    "/request-otp",
    (_req, res, next) => {
        res.locals.auth = { userId: "test-user-id", role: "USER" };
        next();
    },
    requestOtp
);

app.post(
    "/verify-otp",
    (_req, res, next) => {
        res.locals.auth = { userId: "test-user-id", role: "USER" };
        next();
    },
    verifyOtp
);

app.post("/set-role",
    (_req, res, next) => {
        res.locals.auth = { userId: "test-user-id" };
        next();
    },
    setRoleSelection
)

jest.mock("../../src/config/redis", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        on: jest.fn(),
    },
}));

jest.mock("../../src/config/db", () => ({
    __esModule: true,
    prisma: {
        account: {
            upsert: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        user: {
            upsert: jest.fn(),
            delete: jest.fn(),
        },
        developer: {
            upsert: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe("checkAuth API", () => {

    beforeEach(() => {
        jest.spyOn(authUtils, "readAuthToken");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /check-auth", () => {

        it("should return unauthorized when token is missing", async () => {
            (authUtils.readAuthToken as jest.Mock).mockReturnValue(null);

            const res = await request(app).get("/check-auth");

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                isAuthorized: false,
                role: null,
                userId: null,
            });
        });

        it("should return authorized when token is valid", async () => {
            (authUtils.readAuthToken as jest.Mock).mockReturnValue({
                userId: "123",
                role: "USER",
            });

            const res = await request(app).get("/check-auth");

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                isAuthorized: true,
                role: "USER",
                userId: "123",
            });
        });

    });
});

describe('getNonce API', () => {
    it('should return a nonce', async () => {
        const res = await request(app).get('/get-nonce');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('nonce');
    });
})

describe('checkUsernameTaken API', () => {
    it('should return true if username is taken', async () => {
        (redis.get as jest.Mock).mockResolvedValue("takenUsername");
        const res = (await request(app).get('/check-username/' + encodeURIComponent('takenUsername')));
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ isTaken: true });
    });

    it('should return true and cache when username is found in db', async () => {
        (redis.get as jest.Mock).mockResolvedValue(null);
        (prisma.account.findUnique as jest.Mock).mockResolvedValue({ id: 'a1' });

        const res = await request(app).get('/check-username/' + encodeURIComponent('dbUsername'));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ isTaken: true });
        expect(redis.set).toHaveBeenCalledWith('username:dbUsername', '1');
    });
});

describe('checkEmailTaken API', () => {
    it('should return true if email is taken', async () => {
        (redis.get as jest.Mock).mockResolvedValue("1");
        const res = await request(app).get('/check-email/' + encodeURIComponent('taken@example.com'));
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ isTaken: true });
    });

    it('should return true and cache when email is found in db', async () => {
        (redis.get as jest.Mock).mockResolvedValue(null);
        (prisma.account.findUnique as jest.Mock).mockResolvedValue({ id: 'a1' });

        const res = await request(app).get('/check-email/' + encodeURIComponent('db@example.com'));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ isTaken: true });
        expect(redis.set).toHaveBeenCalledWith('email:db@example.com', '1');
    });
});

describe('Request Otp API', () => {
    beforeEach(() => {
        jest.spyOn(rateLimit, 'requestOtpRateLimit')
        jest.spyOn(mail, 'sendMail');
    })

    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /request-otp', () => {
        it('Should return 400 if email is missing', async () => {
            const res = await request(app).post('/request-otp').send({
                email: ""
            })

            expect(res.status).toBe(400);
        })

        it('Should return an otp', async () => {
            (rateLimit.requestOtpRateLimit as jest.Mock).mockResolvedValue(true);
            (mail.sendMail as jest.Mock).mockResolvedValue(true);
            const res = await request(app).post('/request-otp').send({
                email: "suraj@gmail.com"
            })

            expect(res.status).toBe(200);
            expect(res.body).toEqual(
                { success: true, message: "OTP sent" }
            )
        })
    })
})

describe('verifyOtp API', () => {
    it('Should return 400 if otp is missing', async () => {
        const res = await request(app).post('/verify-otp').send({
            email: "surajbhoj0101@gmail.com",
            otp: ""
        })

        expect(res.status).toBe(400);
    })

    it('Should return 400 if otp is invalid', async () => {
        (redis.get as jest.Mock).mockResolvedValue("123456");
        const res = await request(app).post('/verify-otp').send({
            email: "surajbhoj0101@gmail.com",
            otp: "654321"
        })

        expect(res.status).toBe(400);
    })

    it('Should return success if otp is valid', async () => {
        (redis.get as jest.Mock).mockResolvedValue("123456");


        const res = await request(app).post('/verify-otp').send({
            email: "surajbhoj0101@gmail.com",
            otp: "123456"
        })

        expect(res.status).toBe(200);
    })
})

describe('setRoleSelection API', () => {
    describe('POST /set-role', () => {
        it('Should return error if no email provided', async() => {
            const res = await request(app).post('/set-role').send({
                username: "suraj",
                companyName: "surya",
                role: "USER",
                email: ""
            })

            expect(res.status).toBe(400);
        })

        it('Should set role selection successfully', async() => {
            (redis.get as jest.Mock).mockResolvedValue("surajbhoj0101@gmail.com");
            (prisma.account.findUnique as jest.Mock).mockResolvedValue({
                id: "a1",
                role: "GUEST",
                walletAddress: "0x123",
                user: null,
                developer: null,
            });
            (prisma.account.upsert as jest.Mock).mockResolvedValue({ id: "a1" });
            (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: "u1" });
            (prisma.developer.upsert as jest.Mock).mockResolvedValue({ id: "d1" });
            (prisma.account.update as jest.Mock).mockResolvedValue({
                id: "a1",
                role: "USER",
                walletAddress: "0x123",
            });

            const res = await request(app).post('/set-role').send({
                username: "suraj",
                companyName: "surya",
                role: "USER",
                email: "surajbhoj0101@gmail.com"
            })

            expect(res.status).toBe(200);
        })

    })
})