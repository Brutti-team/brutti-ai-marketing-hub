export const facebookRequests = [
  {
    name: "Facebook Brand Awareness Post",
    platform: "Facebook",
    status: "Review",
    time: "10 Aug 2026, 9:59 AM",
  },
] as const;

export const facebookGeneratedContent = [
  {
    title: "Facebook Brand Awareness Post",
    status: "Review",
    content:
      "Kenali BRUTTI — dari Sabah, untuk rumah anda. Kami mencipta perabot bespoke yang mesra alam, diilhamkan oleh keindahan tempatan dan dibuat dengan perhatian kepada kualiti serta ketahanan. Jelajah BRUTTI Furniture Collection untuk menemukan rekaan unik yang menyatukan estetika dan kelestarian.",
  },
] as const;

export const systemFiles = [
  { label: "Facebook marketing requests", status: "Connected" },
  { label: "Facebook generated content", status: "Connected" },
  { label: "Product database", status: "Photos pending" },
  { label: "Facebook analytics", status: "Facebook only" },
] as const;

export const links = {
  marketingRequests:
    "https://app.notion.com/p/0275f137041243a78b2debfb6188a42b?pvs=204",
  dailyPlanner: "https://app.notion.com/p/aa9bba5017fd4d279bbb82a2247424d4",
  plannerSheet:
    "https://docs.google.com/spreadsheets/d/10o2HcCKqbkcvTPx58MKiKG2bx6cnvBtuJULEIEWG8xQ/edit",
  driveRoot:
    "https://drive.google.com/drive/folders/1V3AIjXMqIWU5mi6tG2m4UzDGv1rhBqgO",
} as const;
