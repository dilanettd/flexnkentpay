/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#bcd7ff",
          300: "#8bbfff",
          400: "#549dff",
          500: "#2a7aff",
          600: "#0167F3", // Votre couleur primaire actuelle
          700: "#0050c9",
          800: "#0043a3",
          900: "#003c85",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        black: "#000000",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
        "card-hover":
          "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)",
        "input-focus": "0 0 0 3px rgba(1, 103, 243, 0.2)",
      },
    },
  },
  plugins: [
    // Plugin pour ajouter des composants personnalisés
    function ({ addComponents, theme }) {
      const components = {
        // Typographie
        ".h1": {
          fontSize: "2.5rem",
          fontWeight: "700",
          lineHeight: "1.2",
          marginBottom: "1rem",
          color: theme("colors.gray.900"),
        },
        ".h2": {
          fontSize: "2rem",
          fontWeight: "700",
          lineHeight: "1.3",
          marginBottom: "0.75rem",
          color: theme("colors.gray.900"),
        },
        ".h3": {
          fontSize: "1.75rem",
          fontWeight: "600",
          lineHeight: "1.4",
          marginBottom: "0.75rem",
          color: theme("colors.gray.900"),
        },
        ".h4": {
          fontSize: "1.5rem",
          fontWeight: "600",
          lineHeight: "1.4",
          marginBottom: "0.5rem",
          color: theme("colors.gray.900"),
        },
        ".h5": {
          fontSize: "1.25rem",
          fontWeight: "600",
          lineHeight: "1.5",
          marginBottom: "0.5rem",
          color: theme("colors.gray.900"),
        },
        ".h6": {
          fontSize: "1rem",
          fontWeight: "600",
          lineHeight: "1.5",
          marginBottom: "0.5rem",
          color: theme("colors.gray.900"),
        },
        ".lead": {
          fontSize: "1.25rem",
          fontWeight: "400",
          lineHeight: "1.6",
          color: theme("colors.gray.700"),
        },
        ".paragraph": {
          fontSize: "1rem",
          lineHeight: "1.6",
          marginBottom: "1rem",
          color: theme("colors.gray.700"),
        },
        ".small": {
          fontSize: "0.875rem",
          lineHeight: "1.5",
          color: theme("colors.gray.600"),
        },
        ".text-muted": {
          color: theme("colors.gray.500"),
        },

        // Boutons
        ".btn": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "500",
          textAlign: "center",
          verticalAlign: "middle",
          userSelect: "none",
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
          borderRadius: "0.375rem",
          borderWidth: "1px",
          borderStyle: "solid",
          transitionProperty: "all",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          transitionDuration: "150ms",
          cursor: "pointer",
          "&:focus": {
            outline: "none",
            boxShadow: theme("boxShadow.input-focus"),
          },
          "&:disabled": {
            opacity: "0.65",
            pointerEvents: "none",
            cursor: "not-allowed",
          },
        },
        ".btn-primary": {
          backgroundColor: theme("colors.primary.600"),
          color: "white",
          borderColor: theme("colors.primary.600"),
          "&:hover": {
            backgroundColor: theme("colors.primary.700"),
            borderColor: theme("colors.primary.700"),
          },
          "&:focus": {
            boxShadow: `0 0 0 0.2rem ${theme("colors.primary.200")}`,
          },
          "&:active": {
            backgroundColor: theme("colors.primary.800"),
            borderColor: theme("colors.primary.800"),
          },
        },
        ".btn-outline-primary": {
          color: theme("colors.primary.600"),
          backgroundColor: "transparent",
          borderColor: theme("colors.primary.600"),
          "&:hover": {
            backgroundColor: theme("colors.primary.600"),
            color: "white",
          },
          "&:focus": {
            boxShadow: `0 0 0 0.2rem ${theme("colors.primary.200")}`,
          },
          "&:active": {
            backgroundColor: theme("colors.primary.700"),
            borderColor: theme("colors.primary.700"),
            color: "white",
          },
        },
        ".btn-secondary": {
          backgroundColor: theme("colors.gray.500"),
          color: "white",
          borderColor: theme("colors.gray.500"),
          "&:hover": {
            backgroundColor: theme("colors.gray.600"),
            borderColor: theme("colors.gray.600"),
          },
          "&:focus": {
            boxShadow: `0 0 0 0.2rem ${theme("colors.gray.300")}`,
          },
          "&:active": {
            backgroundColor: theme("colors.gray.700"),
            borderColor: theme("colors.gray.700"),
          },
        },
        ".btn-outline-secondary": {
          color: theme("colors.gray.600"),
          backgroundColor: "transparent",
          borderColor: theme("colors.gray.500"),
          "&:hover": {
            backgroundColor: theme("colors.gray.500"),
            color: "white",
          },
          "&:focus": {
            boxShadow: `0 0 0 0.2rem ${theme("colors.gray.300")}`,
          },
          "&:active": {
            backgroundColor: theme("colors.gray.600"),
            borderColor: theme("colors.gray.600"),
            color: "white",
          },
        },
        ".btn-dark": {
          backgroundColor: theme("colors.gray.800"),
          color: "white",
          borderColor: theme("colors.gray.800"),
          "&:hover": {
            backgroundColor: theme("colors.black"),
            borderColor: theme("colors.black"),
          },
          "&:focus": {
            boxShadow: `0 0 0 0.2rem ${theme("colors.gray.400")}`,
          },
        },
        ".btn-outline-dark": {
          color: theme("colors.gray.800"),
          backgroundColor: "transparent",
          borderColor: theme("colors.gray.800"),
          "&:hover": {
            backgroundColor: theme("colors.gray.800"),
            color: "white",
          },
          "&:focus": {
            boxShadow: `0 0 0 0.2rem ${theme("colors.gray.400")}`,
          },
        },
        ".btn-sm": {
          padding: "0.25rem 0.5rem",
          fontSize: "0.75rem",
          borderRadius: "0.25rem",
        },
        ".btn-lg": {
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          borderRadius: "0.5rem",
        },
        ".btn-icon": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: "2.5rem",
          width: "2.5rem",
          padding: "0",
          fontSize: "1rem",
          borderRadius: "9999px",
        },
        ".btn-icon-sm": {
          height: "2rem",
          width: "2rem",
          fontSize: "0.875rem",
        },
        ".btn-icon-lg": {
          height: "3.5rem",
          width: "3.5rem",
          fontSize: "1.25rem",
        },
        ".btn-block": {
          display: "flex",
          width: "100%",
        },

        // Formulaires et inputs
        ".input": {
          display: "block",
          width: "100%",
          padding: "0.5rem 0.75rem",
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
          color: theme("colors.gray.700"),
          backgroundColor: "white",
          backgroundClip: "padding-box",
          border: `1px solid ${theme("colors.gray.300")}`,
          borderRadius: "0.375rem",
          transition:
            "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
          "&:focus": {
            borderColor: theme("colors.primary.400"),
            outline: "0",
            boxShadow: theme("boxShadow.input-focus"),
          },
          "&::placeholder": {
            color: theme("colors.gray.400"),
            opacity: "1",
          },
          "&:disabled, &[readonly]": {
            backgroundColor: theme("colors.gray.100"),
            opacity: "1",
            cursor: "not-allowed",
          },
        },
        ".input-sm": {
          padding: "0.25rem 0.5rem",
          fontSize: "0.75rem",
          borderRadius: "0.25rem",
        },
        ".input-lg": {
          padding: "0.75rem 1rem",
          fontSize: "1rem",
          borderRadius: "0.5rem",
        },
        ".input-group": {
          position: "relative",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          width: "100%",
        },
        ".input-group-text": {
          display: "flex",
          alignItems: "center",
          padding: "0.5rem 0.75rem",
          fontSize: "0.875rem",
          fontWeight: "400",
          lineHeight: "1.25rem",
          color: theme("colors.gray.700"),
          textAlign: "center",
          whiteSpace: "nowrap",
          backgroundColor: theme("colors.gray.100"),
          border: `1px solid ${theme("colors.gray.300")}`,
          borderRadius: "0.375rem",
        },
        ".input-group > .input:not(:first-child)": {
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
        },
        ".input-group > .input:not(:last-child)": {
          borderTopRightRadius: "0",
          borderBottomRightRadius: "0",
        },

        ".select": {
          display: "block",
          width: "100%",
          padding: "0.5rem 2rem 0.5rem 0.75rem",
          fontSize: "0.875rem",
          fontWeight: "400",
          lineHeight: "1.25rem",
          color: theme("colors.gray.700"),
          verticalAlign: "middle",
          backgroundColor: "white",
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.75rem center",
          backgroundSize: "16px 12px",
          border: `1px solid ${theme("colors.gray.300")}`,
          borderRadius: "0.375rem",
          appearance: "none",
          transition:
            "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
          "&:focus": {
            borderColor: theme("colors.primary.400"),
            outline: "0",
            boxShadow: theme("boxShadow.input-focus"),
          },
          "&:disabled": {
            backgroundColor: theme("colors.gray.100"),
            opacity: "1",
            cursor: "not-allowed",
          },
        },

        ".checkbox": {
          appearance: "none",
          padding: "0",
          colorAdjust: "exact",
          display: "inline-block",
          verticalAlign: "middle",
          backgroundOrigin: "border-box",
          userSelect: "none",
          flexShrink: "0",
          height: "1rem",
          width: "1rem",
          color: theme("colors.primary.600"),
          backgroundColor: "white",
          borderColor: theme("colors.gray.300"),
          borderWidth: "1px",
          borderRadius: "0.25rem",
          "&:focus": {
            outline: "none",
            borderColor: theme("colors.primary.400"),
            boxShadow: theme("boxShadow.input-focus"),
          },
          "&:checked": {
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderColor: "transparent",
            backgroundColor: "currentColor",
            backgroundImage: `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`,
          },
          "&:disabled": {
            backgroundColor: theme("colors.gray.100"),
            borderColor: theme("colors.gray.200"),
            opacity: "0.7",
            cursor: "not-allowed",
          },
          "&:disabled:checked": {
            backgroundColor: theme("colors.gray.400"),
          },
        },

        ".radio": {
          appearance: "none",
          padding: "0",
          colorAdjust: "exact",
          display: "inline-block",
          verticalAlign: "middle",
          backgroundOrigin: "border-box",
          userSelect: "none",
          flexShrink: "0",
          height: "1rem",
          width: "1rem",
          color: theme("colors.primary.600"),
          backgroundColor: "white",
          borderColor: theme("colors.gray.300"),
          borderWidth: "1px",
          borderRadius: "9999px",
          "&:focus": {
            outline: "none",
            borderColor: theme("colors.primary.400"),
            boxShadow: theme("boxShadow.input-focus"),
          },
          "&:checked": {
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderColor: "transparent",
            backgroundColor: "currentColor",
            backgroundImage: `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e")`,
          },
          "&:disabled": {
            backgroundColor: theme("colors.gray.100"),
            borderColor: theme("colors.gray.200"),
            opacity: "0.7",
            cursor: "not-allowed",
          },
          "&:disabled:checked": {
            backgroundColor: theme("colors.gray.400"),
          },
        },

        ".form-label": {
          display: "block",
          marginBottom: "0.5rem",
          fontSize: "0.875rem",
          fontWeight: "500",
          lineHeight: "1.25rem",
          color: theme("colors.gray.700"),
        },

        ".form-group": {
          marginBottom: "1rem",
        },

        ".form-text": {
          marginTop: "0.25rem",
          fontSize: "0.75rem",
          color: theme("colors.gray.500"),
        },

        ".form-error": {
          marginTop: "0.25rem",
          fontSize: "0.75rem",
          color: "#dc2626",
        },

        // Input flottant
        ".form-floating": {
          position: "relative",
          "& > .input, & > .select": {
            height: "calc(3.5rem + 2px)",
            lineHeight: "1.25",
            padding: "1rem 0.75rem",
          },
          "& > label": {
            position: "absolute",
            top: "0",
            left: "0",
            height: "100%",
            padding: "1rem 0.75rem",
            pointerEvents: "none",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "transparent",
            transformOrigin: "0 0",
            transition: "opacity 0.1s ease-in-out, transform 0.1s ease-in-out",
            color: theme("colors.gray.500"),
          },
          "& > .input::placeholder, & > .select::placeholder": {
            color: "transparent",
          },
          "& > .input:focus, & > .select:focus, & > .input:not(:placeholder-shown), & > .select:not(:placeholder-shown)":
            {
              paddingTop: "1.625rem",
              paddingBottom: "0.625rem",
            },
          "& > .input:focus ~ label, & > .select:focus ~ label, & > .input:not(:placeholder-shown) ~ label, & > .select:not(:placeholder-shown) ~ label":
            {
              opacity: "0.65",
              transform: "scale(0.85) translateY(-0.5rem) translateX(0.15rem)",
            },
        },

        // Card component
        ".card": {
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minWidth: "0",
          wordWrap: "break-word",
          backgroundColor: "white",
          backgroundClip: "border-box",
          border: `1px solid ${theme("colors.gray.200")}`,
          borderRadius: "0.25rem",
          boxShadow: theme("boxShadow.card"),
          transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
          "&:hover": {
            boxShadow: theme("boxShadow.card-hover"),
          },
        },
        ".card-header": {
          padding: "1rem 1.25rem",
          marginBottom: "0",
          backgroundColor: "rgba(0,0,0,0.03)",
          borderBottom: `1px solid ${theme("colors.gray.200")}`,
          "&:first-child": {
            borderTopLeftRadius: "calc(0.25rem - 1px)",
            borderTopRightRadius: "calc(0.25rem - 1px)",
          },
        },
        ".card-body": {
          flex: "1 1 auto",
          padding: "1.25rem",
        },
        ".card-title": {
          marginBottom: "0.75rem",
          fontSize: "1.25rem",
          fontWeight: "600",
        },
        ".card-text": {
          marginTop: "0",
          marginBottom: "1rem",
        },
        ".card-footer": {
          padding: "0.75rem 1.25rem",
          backgroundColor: "rgba(0,0,0,0.03)",
          borderTop: `1px solid ${theme("colors.gray.200")}`,
          "&:last-child": {
            borderBottomRightRadius: "calc(0.25rem - 1px)",
            borderBottomLeftRadius: "calc(0.25rem - 1px)",
          },
        },
      };

      addComponents(components);
    },
  ],
};
