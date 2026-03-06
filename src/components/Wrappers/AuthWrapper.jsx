import { useEffect, useState, useCallback } from "react";
import useAuthStore from "../../stores/authStore";
import { Snackbar, Slide, IconButton } from "@mui/material";
import {
  CheckCircleOutline,
  ErrorOutline,
  WarningAmber,
  InfoOutlined,
  Close,
} from "@mui/icons-material";

const MAX_VISIBLE = 5;

const severityConfig = {
  success: {
    icon: <CheckCircleOutline sx={{ fontSize: 22 }} />,
    bg: "linear-gradient(135deg, #0d9f61 0%, #12b76a 100%)",
    border: "rgba(18, 183, 106, 0.3)",
  },
  error: {
    icon: <ErrorOutline sx={{ fontSize: 22 }} />,
    bg: "linear-gradient(135deg, #d92d20 0%, #f04438 100%)",
    border: "rgba(240, 68, 56, 0.3)",
  },
  warning: {
    icon: <WarningAmber sx={{ fontSize: 22 }} />,
    bg: "linear-gradient(135deg, #dc6803 0%, #f79009 100%)",
    border: "rgba(247, 144, 9, 0.3)",
  },
  info: {
    icon: <InfoOutlined sx={{ fontSize: 22 }} />,
    bg: "linear-gradient(135deg, #1570ef 0%, #2e90fa 100%)",
    border: "rgba(46, 144, 250, 0.3)",
  },
};

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

const AuthWrapper = ({ children }) => {
  const { validateToken, snackbars, removeSnackbar } = useAuthStore();

  // Track which snackbars are in "closing" state (animating out)
  const [closingIds, setClosingIds] = useState(new Set());

  useEffect(() => {
    validateToken();
  }, []);

  const handleClose = useCallback(
    (id) => {
      // Mark as closing to trigger MUI's exit transition
      setClosingIds((prev) => new Set(prev).add(id));
      // Remove from store after slide-out animation completes
      setTimeout(() => {
        removeSnackbar(id);
        setClosingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 300);
    },
    [removeSnackbar],
  );

  // Only show the latest MAX_VISIBLE snackbars
  const visibleSnackbars = snackbars.slice(-MAX_VISIBLE);

  return (
    <>
      {children}
      {visibleSnackbars.map((snack, index) => {
        const config = severityConfig[snack.severity] || severityConfig.info;
        const isClosing = closingIds.has(snack.id);
        return (
          <Snackbar
            key={snack.id}
            open={!isClosing}
            autoHideDuration={snack.duration}
            onClose={(e, reason) => {
              if (reason === "clickaway") return;
              handleClose(snack.id);
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            TransitionComponent={SlideTransition}
            sx={{
              bottom: `${24 + index * 72}px !important`,
              transition: "bottom 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                background: config.bg,
                border: `1px solid ${config.border}`,
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)",
                backdropFilter: "blur(12px)",
                color: "#fff",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                minWidth: "300px",
                maxWidth: "440px",
                letterSpacing: "0.01em",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  opacity: 0.95,
                }}
              >
                {config.icon}
              </span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{snack.message}</span>
              <IconButton
                size="small"
                onClick={() => handleClose(snack.id)}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  "&:hover": {
                    color: "#fff",
                    background: "rgba(255,255,255,0.1)",
                  },
                  padding: "4px",
                }}
              >
                <Close sx={{ fontSize: 18 }} />
              </IconButton>
            </div>
          </Snackbar>
        );
      })}
    </>
  );
};

export default AuthWrapper;
