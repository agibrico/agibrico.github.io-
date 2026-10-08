import { storage, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { QRCodeItem } from '../types/qr';

export async function compressAndUploadBase64Image(
  dataUrl: string,
  path: string
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  if (!storage) {
    console.warn("Firebase Storage non initialisé. Conservation de la Data URL.");
    return dataUrl;
  }

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    const compressedBlob = await new Promise<Blob>((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 1200;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (b) => resolve(b || blob),
            'image/jpeg',
            0.85
          );
        } else {
          resolve(blob);
        }
      };
      img.onerror = () => resolve(blob);
    });

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, compressedBlob);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.error("Échec de compression/upload du média vers Firebase Storage:", err);
    return dataUrl;
  }
}

export async function processAndUploadCardMedia(
  item: QRCodeItem,
  uid: string
): Promise<QRCodeItem> {
  const cloned: QRCodeItem = JSON.parse(JSON.stringify(item));
  const publicId = cloned.publicId || 'DEFAULT_CARD';
  const basePath = `users/${uid}/cards/${publicId}`;

  const processUrl = async (val: string, subPath: string): Promise<string> => {
    if (val && typeof val === 'string' && val.startsWith('data:')) {
      return await compressAndUploadBase64Image(val, `${basePath}/${subPath}_${Date.now()}.jpg`);
    }
    return val;
  };

  if (cloned.content) {
    if (cloned.content.photoUrl) {
      cloned.content.photoUrl = await processUrl(cloned.content.photoUrl, 'photo');
    }
    if (cloned.content.logoUrl) {
      cloned.content.logoUrl = await processUrl(cloned.content.logoUrl, 'logo');
    }
    if (cloned.content.bannerUrl) {
      cloned.content.bannerUrl = await processUrl(cloned.content.bannerUrl, 'banner');
    }
    if (Array.isArray(cloned.content.menuItems)) {
      for (let i = 0; i < cloned.content.menuItems.length; i++) {
        const itemMenu: any = cloned.content.menuItems[i];
        if (itemMenu.imageUrl) {
          itemMenu.imageUrl = await processUrl(itemMenu.imageUrl, `menu_${i}`);
        }
        if (itemMenu.photoUrl) {
          itemMenu.photoUrl = await processUrl(itemMenu.photoUrl, `menu_photo_${i}`);
        }
      }
    }
    if (Array.isArray(cloned.content.customSections)) {
      for (let i = 0; i < cloned.content.customSections.length; i++) {
        const section: any = cloned.content.customSections[i];
        if (section.imageUrl) {
          section.imageUrl = await processUrl(section.imageUrl, `section_${i}`);
        }
      }
    }
  }

  if (cloned.styling && cloned.styling.logoUrl) {
    cloned.styling.logoUrl = await processUrl(cloned.styling.logoUrl, 'styling_logo');
  }

  return cloned;
}
