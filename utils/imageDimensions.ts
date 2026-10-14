// Intrinsic sizes of existing public photos reserve space before lazy images load.
const dimensions: Record<string, { width: number; height: number }> = {
  "reach-for-her-school-activity.jpg": { width: 1503, height: 1046 },
  "IMG-20221012-WA0013.jpg": {
    "width": 1000,
    "height": 1250
  },
  "IMG-20250902-WA0052.jpg": {
    "width": 798,
    "height": 1080
  },
  "IMG-20250902-WA0054.jpg": {
    "width": 1080,
    "height": 681
  },
  "IMG_0010.jpg": {
    "width": 3600,
    "height": 2400
  },
  "IMG_0011.jpg": {
    "width": 2400,
    "height": 3600
  },
  "IMG_0017.jpg": {
    "width": 2000,
    "height": 1333
  },
  "IMG_0116.jpg": {
    "width": 2000,
    "height": 1333
  },
  "IMG_0196.jpg": {
    "width": 1000,
    "height": 667
  },
  "IMG_0253.jpg": {
    "width": 2000,
    "height": 1333
  },
  "IMG_0308.jpg": {
    "width": 2000,
    "height": 1333
  },
  "IMG_0579.jpg": {
    "width": 1000,
    "height": 667
  },
  "IMG_0618.jpg": {
    "width": 1000,
    "height": 667
  },
  "IMG_1420.jpg": {
    "width": 1000,
    "height": 667
  },
  "IMG_1550.jpg": {
    "width": 1000,
    "height": 667
  },
  "IMG_1632.jpg": {
    "width": 3600,
    "height": 2400
  },
  "IMG_1642.jpg": {
    "width": 3600,
    "height": 2400
  },
  "IMG_1647.jpg": {
    "width": 3600,
    "height": 2400
  },
  "IMG_2545.jpg": {
    "width": 3600,
    "height": 2400
  },
  "IMG_2775.jpg": {
    "width": 3600,
    "height": 2400
  },
  "IMG_WhatsApp.jpg": {
    "width": 2000,
    "height": 1245
  },
  "Safe-flow-readbook.jpg": {
    "width": 3600,
    "height": 2403
  },
  "Screenshot_20230204-124840 (1).jpg": {
    "width": 720,
    "height": 631
  },
  "brave-1.jpg": {
    "width": 1080,
    "height": 720
  },
  "brave-10.jpg": {
    "width": 798,
    "height": 1080
  },
  "brave-11.jpg": {
    "width": 1080,
    "height": 742
  },
  "brave-12.jpg": {
    "width": 1080,
    "height": 680
  },
  "brave-2.jpg": {
    "width": 1080,
    "height": 720
  },
  "brave-3.jpg": {
    "width": 1080,
    "height": 720
  },
  "brave-4.jpg": {
    "width": 1080,
    "height": 779
  },
  "brave-5.jpg": {
    "width": 816,
    "height": 1080
  },
  "brave-6.jpg": {
    "width": 761,
    "height": 1080
  },
  "brave-7.jpg": {
    "width": 1080,
    "height": 720
  },
  "brave-8.jpg": {
    "width": 1080,
    "height": 720
  },
  "brave-9.jpg": {
    "width": 1080,
    "height": 779
  },
  "brave-featured.jpg": {
    "width": 1024,
    "height": 644
  },
  "brave-featured.png": {
    "width": 1024,
    "height": 524
  },
  "brave-thumb.jpg": {
    "width": 1080,
    "height": 681
  },
  "covid-2.jpg": {
    "width": 715,
    "height": 740
  },
  "covid-3.jpg": {
    "width": 720,
    "height": 737
  },
  "covid-thumb.jpg": {
    "width": 720,
    "height": 708
  },
  "digi-2.jpg": {
    "width": 2000,
    "height": 1333
  },
  "digi-3.jpg": {
    "width": 2000,
    "height": 1333
  },
  "digi-4.jpg": {
    "width": 2000,
    "height": 1245
  },
  "digi-5.jpg": {
    "width": 2000,
    "height": 1333
  },
  "digi-thumb.jpg": {
    "width": 2000,
    "height": 1333
  },
  "empower-10.jpg": {
    "width": 667,
    "height": 1000
  },
  "empower-11.jpg": {
    "width": 667,
    "height": 1000
  },
  "empower-12.jpg": {
    "width": 667,
    "height": 1000
  },
  "empower-13.jpg": {
    "width": 3600,
    "height": 2700
  },
  "empower-2.jpg": {
    "width": 1000,
    "height": 667
  },
  "empower-3.jpg": {
    "width": 1000,
    "height": 667
  },
  "empower-4.jpg": {
    "width": 1000,
    "height": 667
  },
  "empower-5.jpg": {
    "width": 667,
    "height": 1000
  },
  "empower-6.jpg": {
    "width": 667,
    "height": 1000
  },
  "empower-7.jpg": {
    "width": 667,
    "height": 1000
  },
  "empower-8.jpg": {
    "width": 667,
    "height": 1000
  },
  "empower-9.jpg": {
    "width": 667,
    "height": 1000
  },
  "empower-thumb.jpg": {
    "width": 1000,
    "height": 667
  },
  "hygiene-1.jpg": {
    "width": 2000,
    "height": 1333
  },
  "hygiene-2.jpg": {
    "width": 2000,
    "height": 1333
  },
  "hygiene-3.jpg": {
    "width": 2000,
    "height": 1333
  },
  "idecide-2.jpg": {
    "width": 1280,
    "height": 958
  },
  "idecide-3.jpg": {
    "width": 1000,
    "height": 750
  },
  "idecide-thumb.jpg": {
    "width": 3600,
    "height": 2400
  },
  "safeflow-10.jpg": {
    "width": 3600,
    "height": 2400
  },
  "safeflow-2.jpg": {
    "width": 2400,
    "height": 3600
  },
  "safeflow-3.jpg": {
    "width": 3600,
    "height": 2400
  },
  "safeflow-4.jpg": {
    "width": 3600,
    "height": 2400
  },
  "safeflow-5.jpg": {
    "width": 3600,
    "height": 2400
  },
  "safeflow-6.jpg": {
    "width": 3600,
    "height": 2400
  },
  "safeflow-7.jpg": {
    "width": 2400,
    "height": 3600
  },
  "safeflow-8.jpg": {
    "width": 2400,
    "height": 3600
  },
  "safeflow-9.jpg": {
    "width": 2400,
    "height": 3600
  },
  "safeflow-thumb.jpg": {
    "width": 2400,
    "height": 3600
  },
  "skills-2.jpg": {
    "width": 1000,
    "height": 667
  },
  "skills-3.jpg": {
    "width": 1000,
    "height": 667
  },
  "skills-4.jpg": {
    "width": 1000,
    "height": 667
  },
  "skills-5.jpg": {
    "width": 1000,
    "height": 667
  },
  "skills-6.jpg": {
    "width": 1000,
    "height": 667
  },
  "skills-7.jpg": {
    "width": 1000,
    "height": 667
  },
  "skills-thumb.jpg": {
    "width": 1000,
    "height": 667
  },
  "slide-1.png": {
    "width": 3600,
    "height": 2700
  },
  "slide-2.png": {
    "width": 1080,
    "height": 720
  },
  "slide-3.png": {
    "width": 3600,
    "height": 2400
  },
  "smart1.jpg": {
    "width": 3600,
    "height": 2400
  },
  "smart2.jpg": {
    "width": 3600,
    "height": 2400
  },
  "smart3.jpg": {
    "width": 3600,
    "height": 2400
  },
  "smart4.jpg": {
    "width": 3600,
    "height": 2400
  },
  "smartgirl-2.jpg": {
    "width": 3600,
    "height": 2400
  },
  "smartgirl-3.jpg": {
    "width": 3600,
    "height": 2400
  },
  "smartgirl-4.jpg": {
    "width": 3600,
    "height": 2400
  },
  "smartgirl-5.jpg": {
    "width": 3600,
    "height": 2400
  },
  "smartgirl-6.jpg": {
    "width": 3600,
    "height": 2400
  },
  "smartgirl-thumb.jpg": {
    "width": 3600,
    "height": 2400
  },
  "vee-2.jpg": {
    "width": 715,
    "height": 724
  },
  "vee-3.jpg": {
    "width": 720,
    "height": 703
  },
  "vee-mentorship.jpg": {
    "width": 720,
    "height": 703
  },
  "vee-thumb.jpg": {
    "width": 704,
    "height": 734
  },
  "yet-1.jpg": {
    "width": 2000,
    "height": 3000
  },
  "yet-10.jpg": {
    "width": 2000,
    "height": 1333
  },
  "yet-11.jpg": {
    "width": 2000,
    "height": 1333
  },
  "yet-12.jpg": {
    "width": 2000,
    "height": 1333
  },
  "yet-2.jpg": {
    "width": 2000,
    "height": 1333
  },
  "yet-3.jpg": {
    "width": 2000,
    "height": 1333
  },
  "yet-4.jpg": {
    "width": 2000,
    "height": 1333
  },
  "yet-5.jpg": {
    "width": 2000,
    "height": 1333
  },
  "yet-6.jpg": {
    "width": 2000,
    "height": 1333
  },
  "yet-7.jpg": {
    "width": 2000,
    "height": 1333
  },
  "yet-8.jpg": {
    "width": 2000,
    "height": 1333
  },
  "yet-9.jpg": {
    "width": 2000,
    "height": 1333
  }
};

export const getImageDimensions = (src: string): { width: number; height: number } | undefined =>
  dimensions[decodeURIComponent(src.split('/').pop() || '')];
