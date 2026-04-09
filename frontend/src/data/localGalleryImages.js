const getImageFileName = (src) => {
  try {
    const decodedSrc = decodeURIComponent(String(src || ""));
    return decodedSrc.split("/").pop()?.toLowerCase() || "";
  } catch {
    return String(src || "").split("/").pop()?.toLowerCase() || "";
  }
};

const mergeUniqueImages = (...imageGroups) => {
  const seen = new Set();

  return imageGroups.flat().filter((src) => {
    const fileName = getImageFileName(src);
    if (!fileName || seen.has(fileName)) return false;
    seen.add(fileName);
    return true;
  });
};

export const LOCAL_GALLERY_SCENE_IMAGES = [
  new URL("../../images_compressed/38880939_1914963555228836_1030091156542717952_n.jpg", import.meta.url).href,
  new URL("../../images_compressed/45732290_2044968658894991_8899078199003054080_n.jpg", import.meta.url).href,
  new URL("../../images_compressed/506934075_23972180409080501_3626938193783427199_n.jpg", import.meta.url).href,
  new URL("../../images_compressed/506951372_23972179995747209_6193219068810370539_n.jpg", import.meta.url).href,
  new URL("../../images_compressed/507770982_23972180222413853_7353743889238840971_n.jpg", import.meta.url).href,
  new URL("../../images_compressed/509220099_24019353687696506_9093851151208495022_n.jpg", import.meta.url).href,
  new URL("../../images_compressed/509423231_24009920875306454_1193535363751953500_n.jpg", import.meta.url).href,
  new URL("../../images_compressed/510309815_24037514755880399_8999308169109310071_n.jpg", import.meta.url).href,
  new URL("../../images_compressed/510518244_24037514675880407_1896907933659602942_n.jpg", import.meta.url).href,
  new URL("../../images_compressed/510961718_24057557300542811_2477940737044768561_n.jpg", import.meta.url).href,
  new URL("../../images_compressed/511649419_24048713184760556_4117450987407162675_n.jpg", import.meta.url).href,
  new URL("../../images_compressed/CON07364.jpg", import.meta.url).href,
  new URL("../../images_compressed/CON07612.jpg", import.meta.url).href,
  new URL("../../images_compressed/CON07663.jpg", import.meta.url).href,
  new URL("../../images_compressed/DSC02639.jpg", import.meta.url).href,
  new URL("../../images_compressed/DSC02658.jpg", import.meta.url).href,
  new URL("../../images_compressed/DSC02686.jpg", import.meta.url).href,
  new URL("../../images_compressed/DSC02717-Enhanced-NR.jpg", import.meta.url).href,
  new URL("../../images_compressed/DSC02731-Enhanced-NR.jpg", import.meta.url).href,
  new URL("../../images_compressed/DSC02952.jpg", import.meta.url).href,
  new URL("../../images_compressed/DSC03088.jpg", import.meta.url).href,
  new URL("../../images_compressed/DSC03233.jpg", import.meta.url).href,
  new URL("../../images_compressed/DSC03302.jpg", import.meta.url).href,
  new URL("../../images_compressed/DSC07210.jpg", import.meta.url).href,
  new URL("../../images_compressed/FP_114.jpg", import.meta.url).href,
  new URL("../../images_compressed/IMG_6014.jpg", import.meta.url).href,
  new URL("../../images_compressed/IMG_6162.jpg", import.meta.url).href,
  new URL("../../images_compressed/IMG_6296.jpg", import.meta.url).href,
];

const LOCAL_GALLERY_EXTRA_ARCHIVE_IMAGES = [
  new URL("../../compressed_images (1)/45859630_2044968995561624_3093443640823906304_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/502578912_24010854568546418_5732003957775663322_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/504811009_23946411961657346_5026657854294648645_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/505929288_23946715891626953_6843582560978465554_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/506356636_23949064088058800_7112299341670571794_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/507990397_23972179975747211_5891711361114130710_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/508390811_23995120840119791_8301855857721434662_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/508635270_24003994122565796_4744334068381889354_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/509426747_24009920695306472_4252922052894659966_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/510333057_24037514752547066_8211696501980622220_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/510449784_24037516492546892_7509609795883582392_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/510526945_24037516309213577_2042008424444314405_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/510800232_24057555543876320_4613237795284147374_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/512674101_24057555537209654_2442611871409672618_n.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/Batch 2013.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/CON07378.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/CON07458.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/CON07573.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC00023.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC02641.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC02763-Enhanced-NR.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC02828.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC02864.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC03041.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC03550.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC03568.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC03619.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC03635.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC03643.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC03657.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC03764.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC04468.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC04501.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC04523.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC07208.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/DSC07230.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/IMG_4276.jpg", import.meta.url).href,
  new URL("../../compressed_images (1)/IMG_6426.jpg", import.meta.url).href,
];

export const LOCAL_GALLERY_ARCHIVE_IMAGES = mergeUniqueImages(
  LOCAL_GALLERY_SCENE_IMAGES,
  LOCAL_GALLERY_EXTRA_ARCHIVE_IMAGES
);
