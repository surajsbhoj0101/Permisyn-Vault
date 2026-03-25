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
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <p>{notice}</p>
            <button
              type="button"
              onClick={onClearNotice}
              className="text-emerald-700 hover:text-emerald-900"
              aria-label="Close success notice"
            >
              x
            </button>
          </div>
        </div>
      ) : null}

      {redNotice ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <p>{redNotice}</p>
            <button
              type="button"
              onClick={onClearRedNotice}
              className="text-red-700 hover:text-red-900"
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
