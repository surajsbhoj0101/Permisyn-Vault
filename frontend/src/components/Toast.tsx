type ToastProps = {
  notice?: string | null;
  redNotice?: string | null;
  onClearNotice?: () => void;
  onClearRedNotice?: () => void;
};

function Toast({
  notice,
  redNotice,
  onClearNotice,
  onClearRedNotice,
}: ToastProps) {
  if (!notice && !redNotice) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {notice ? (
        <div
          className="saas-card rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--border)",
            background: "rgba(121,168,255,0.18)",
            color: "var(--text)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{notice}</p>
            <button
              type="button"
              onClick={onClearNotice}
              className="opacity-80 hover:opacity-100"
              style={{ color: "var(--text)" }}
              aria-label="Close success notice"
            >
              x
            </button>
          </div>
        </div>
      ) : null}

      {redNotice ? (
        <div
          className="saas-card rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: "rgba(255,150,170,0.4)",
            background: "var(--danger-soft)",
            color: "#ffd9e2",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{redNotice}</p>
            <button
              type="button"
              onClick={onClearRedNotice}
              className="opacity-80 hover:opacity-100"
              style={{ color: "#ffd9e2" }}
              aria-label="Close error notice"
            >
              x
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Toast;
