import {reactive, toRefs} from 'vue';
import {changeUploadProgress, changeStatus} from '@//Modules/Business/notification';
import {addPhotoToPhotosData} from '@//Modules/Business/photos';
import useCompressImage from '@//Modules/Business/compressImage';

const state = reactive({
  isUploadCanceled: false,
  isUploading: false,
  pause: false,
});

export function exportUploadInfoState () {
  return { ...toRefs(state) };
}

export function pauseUploading () {
  state.pause = true;
}

export function continueUploading () {
  state.pause = false;
}

export function cancelUploadImages () {
  state.isUploadCanceled = true;
}

export default async function uploadImages (files, albumId, optionsForCompressing) {
  state.isUploadCanceled = false;
  for (let i = 0; i < files.length; i++) {
    state.isUploading = true;
    const formData = new FormData();
    const { compressedImage, compressImage } = useCompressImage(files[i], optionsForCompressing);
    await compressImage();
    formData.append('file', compressedImage.value ?? files[i]);
    formData.append('album_id', albumId);
    while (state.pause) {
      // Pause the loop while state.pause is true
      await new Promise((resolve) => {
        if (state.isUploadCanceled) {
          state.isUploadCanceled = false;
          state.pause = false;
          while (i < files.length) {
            changeStatus('canceled', files[i].name, files[i]);
            i++;
          }
          state.isUploading = false;
          return;
        }
        setTimeout(resolve, 200);
      });
    }

    axios.post(route('business.photos.store'), formData, {
      onUploadProgress: (progressEvent) => {
        changeUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total), files[i].name);
      },

    }).then(response => {
      changeStatus('success',files[i].name, response.data.photo);
      addPhotoToPhotosData(response.data.photo, albumId);
    }).catch(error => {
      changeStatus('error', files[i].name, files[i], error);
    });
    state.isUploading = false;
  }
}