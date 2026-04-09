const compressedGalleryModules = import.meta.glob("../../compressed_images (1)/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  import: "default",
  query: "?url",
});

const COMPRESSED_GALLERY_IMAGES = Object.entries(compressedGalleryModules)
  .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath))
  .map(([, src]) => src)
  .filter(Boolean);

export const LOCAL_GALLERY_SCENE_IMAGES = COMPRESSED_GALLERY_IMAGES;
export const LOCAL_GALLERY_ARCHIVE_IMAGES = COMPRESSED_GALLERY_IMAGES;
