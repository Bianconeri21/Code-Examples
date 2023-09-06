import {reactive, toRefs} from 'vue';
import {changeStatus} from '@//Modules/Business/notification';
import Logo from '@//Components/Icons/Logo.vue';

const state = reactive({
  compressedImage: null,
});

export default function useCompressImage (file, compressSettings) {
  const compressImage = async () => {
    if (!file) {
      return;
    }
    // Get as image data
    await createImageBitmap(file)
      .then(async (response) => {
        const imageBitmap = response;
        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        const canvasContext = canvas.getContext('2d');

        const settings = {
          fileType: file.type,
          quality: 1,
        };

        if (compressSettings.format.enabled) {
          settings.fileType = compressSettings.format.value;
        }
        if (compressSettings.quality.enabled) {
          settings.quality = Number(compressSettings.quality.value);
        }

        if (compressSettings.max_edge.enabled) {
          // compressSettings.max_edge.value = Number(compressSettings.max_edge.value);
          if (imageBitmap.width < imageBitmap.height && imageBitmap.height > compressSettings.max_edge.value) {
            canvas.height = compressSettings.max_edge.value;
            canvas.width = (imageBitmap.width / imageBitmap.height) * compressSettings.max_edge.value;
          } else if (imageBitmap.height < imageBitmap.width && imageBitmap.width > compressSettings.max_edge.value) {
            canvas.width = compressSettings.max_edge.value;
            canvas.height = (imageBitmap.height / imageBitmap.width) * compressSettings.max_edge.value;
          }
        }
        // Turn into Blob
        canvasContext.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, settings.fileType, settings.quality));
        // Turn Blob into File
        state.compressedImage = new File([blob], file.name, {
          type: blob.type,
        });
      })
      .catch(error => {
        changeStatus('error', file.name, file, error);
        state.compressedImage = null;
      });
  };

  return { ...toRefs(state), compressImage };
}
