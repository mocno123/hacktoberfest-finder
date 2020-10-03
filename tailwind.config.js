module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: ["./src/**/*.html", "./src/**/*.vue", "./src/**/*.jsx"],
  theme: {
    extend: {
      colors: {
        "hacktoberfest-blue": "#0069ff",
        "hacktoberfest-orange": "#9c4668",
      },
    },
  },
  variants: {},
  plugins: [],
};
