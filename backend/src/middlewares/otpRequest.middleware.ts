import redis from "../config/redis";

export const requestOtpRateLimit = async (email: string): Promise<boolean> => {
  const normalizedEmail = email.trim().toLowerCase();
  const rateLimitKey = `otp-rate-limit:${normalizedEmail}`;

  try {
    const currentCount = await redis.get(rateLimitKey);
    if (currentCount && parseInt(currentCount) >= 5) {
      return false; // Rate limit exceeded
    }

    await redis
      .multi()
      .incr(rateLimitKey)
      .expire(rateLimitKey, 3600) // 1 hour expiration
      .exec();

    return true; // Allowed to request OTP
  } catch (error) {
    console.error("Error in requestOtpRateLimit:", error);
    return false; // In case of error, treat as rate limit exceeded
  }
};
