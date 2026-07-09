/** @type {import('@ladle/react').Config} */

// NOTE: Ladle serializes storyOrder via .toString() and rebuilds it in the
// browser with `new Function`, so this callback MUST be self-contained —
// no references to variables outside its own body.
export default {
  stories: "src/**/*.stories.{js,jsx,ts,tsx}",
  storyOrder: (stories) => {
    const order = [
      "runner--browse",
      "runner--event",
      "organizer--login",
      "organizer--dashboard",
      "organizer--create",
      "organizer--manage",
      "organizer--account",
      "admin--console",
    ];
    const rank = (id) => {
      const i = order.findIndex((p) => id.startsWith(p));
      return i === -1 ? order.length : i;
    };
    return [...stories].sort((a, b) => rank(a) - rank(b));
  },
};
