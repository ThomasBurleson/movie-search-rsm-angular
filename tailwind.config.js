const plugin = require("tailwindcss/plugin");
const { createGlobPatternsForDependencies } = require("@nrwl/angular/tailwind");
const { join } = require("path");

module.exports = {
  content: [
    join(__dirname, "src/**/!(*.stories|*.spec).{ts,html}"),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        // Examples of custom colors
        background: "#e5e5e5",
        "ebony-18": "rgba(15, 31, 44, 0.18)",
        "ebony-61": "rgba(15, 31, 44, 0.61)",
        primary: "#0062E3",
      },
      boxShadow: {
        // Examples of custom box shadows
        header: "inset 0px -1px 0px rgba(15, 31, 44, 0.18)",
        footer: "inset 0px 1px 0px rgba(0, 0, 0, 0.08)",
      },
      // Add missing paddings and margins to match designs
      spacing: {
        4.5: "4.5rem",
      },
      margin: {
        4.5: "4.5rem",
      },
    },
  },
  plugins: [
    plugin(({ addBase, addComponents, addUtilities, theme }) => {
      // Examples of using base layer custom styles in a plugin to match designs
      addBase({
        h1: {
          fontSize: "22px",
          lineHeight: "30px",
        },
        p: {
          fontSize: theme("fontSize.xs"),
          lineHeight: "18px",
        },
      });
    }),
  ],
};
