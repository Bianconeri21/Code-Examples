<template>
  <div class="block !my-radius bg-transparent relative group hover:my-thin-shadow"
       :class="{'my-thin-shadow': isActive}">
    <div class="relative" @click="()=>changeItemDetail(album, 'album')">
      <div class="absolute top-5 right-5 my-none-select"
           :class="[showAlbumDotsId === album.id ? 'flex' : 'hidden group-hover:flex']" ref="dropdownDots">
        <Dropdown width="48">
          <template #trigger>
            <IconDots class="text-[#71717A] hover:bg-[#E5E5E5] rounded-full bg-white"
                      @click="emit('changeShowAlbumDotsId',album.id)" />
          </template>
          <template #content>
            <DropdownLink as="button" @click="openItemDetail(album, 'album')">
              <div class="flex items-center gap-2.5">
                <IconInfoCircle />
                <p>View Details</p>
              </div>

            </DropdownLink>
            <DropdownLink as="button" @click="editAlbumDetail">
              <div class="flex gap-2.5 items-center">
                <IconPencilMinus />
                <span>Edit</span>
              </div>
            </DropdownLink>
            <DropdownLink as="button">
              <div class="flex gap-2.5 items-center">
                <IconFolderSymlink />
                <span>Move to</span>
              </div>
            </DropdownLink>
            <DropdownLink as="button">
              <div class="flex gap-2.5 items-center">
                <IconArchive />
                <span>Archive</span>
              </div>
            </DropdownLink>
            <DropdownLink as="button">
              <div class="flex items-center gap-2.5">
                <IconArrowsDiagonalMinimize2 />
                <span>Compress</span>
              </div>
            </DropdownLink>
            <DropdownLink as="button">
              <div class="flex items-center gap-2.5">
                <IconShare3 />
                <span>Share</span>
              </div>
            </DropdownLink>
            <div class="border-t border-gray-200" />
            <DropdownLink as="button">
              <Link :href="route('business.albums.destroy',album.id)"
                    method="delete"
                    :as="'button'"
                    :headers="{'Content-Type': 'application/json'}"
                    @success="removeElementFromAlbumsData(album)"
              >
                <div class="text-[#F46565] flex items-center gap-2.5">
                  <IconTrash />
                  <span>Move to bin</span>
                </div>
              </Link>
            </DropdownLink>

          </template>
        </Dropdown>
      </div>
      <div @dblclick="()=>openAlbum(album.id)">
        <img :src="album.cover_image_url ? album.cover_image_url : Img" alt="Album cover image"
             class="rounded-t-xl h-[180px] w-full object-center">
        <div
          class="rounded-b-xl group-hover:border-0  group-hover:bg-gradient-to-b from-white via-white to-[#F1C644] pb-[1px]"
          :class="isActive ? activeClasses : ''">
          <div
            class="my-border !border-t-0 group-hover:border-transparent bg-white rounded-b-xl w-full py-4 px-5 whitespace-nowrap"
            :class="{'!border-transparent': isActive}">

            <p class="my-subtitle flex">{{ shortText(album.name) }}
              <MyTooltip v-if="album.name.length > 20" :tooltip-text="album.name" direction="none">
                <span>...</span>
              </MyTooltip>
            </p>
            <div class="flex justify-between my-gray-text my-sm-text mt-1">
              <div class="flex gap-2">
                <span>{{ calculateDate(album.created_at) }}</span>
                <span>{{ album.photos_count }} photos</span>
              </div>
              <div>
                {{ sizeWithMB }}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    <modal
      v-model:show="isOpenAlbumEditModal"
      modalTitle="Edit album"
      maxWidth="lg"
      :closeOnOutsideClick="false"
    >
      <AlbumModal :album="album"
                  @closeModal="isOpenAlbumEditModal = false"
                  @modalSubmitted="editAlbum" />
    </modal>
  </div>
</template>

<script setup>
//imports----->
import Dropdown from '@//Components/Dropdown.vue';
import {computed, onMounted, ref} from 'vue';
import DropdownLink from '@//Components/DropdownLink.vue';
import {changeItemDetail, openItemDetail} from '@//Modules/Business/itemDetails';
import {useDateFormat} from '@vueuse/core';
import {Link, router} from '@inertiajs/vue3';
import AlbumModal from '@//Pages/Business/Albums/AlbumModal.vue';
import Modal from '@//Components/Modal.vue';
import MyTooltip from '@//Pages/Business/Components/MyTooltip.vue';
import Img from '../../../../images/cover/album-no-cover.jpg';
import {updateAlbum, removeElementFromAlbumsData} from '@//Modules/Business/albums';
import useSidebarItems from '@/Modules/Business/sidebarItems';

import {
  IconDots,
  IconInfoCircle,
  IconPencilMinus,
  IconFolderSymlink,
  IconArchive,
  IconArrowsDiagonalMinimize2,
  IconShare3,
  IconTrash,
} from '@tabler/icons-vue';

// props and emits---->
const props = defineProps({
  album: {
    type: Object,
    required: true,
  },
  showAlbumDotsId: {
    type: Number || null
  },
  isActive: {
    type: Boolean
  }
});
const emit = defineEmits(['changeShowAlbumDotsId']);


// variables------>
const { error: sidebarError, loadSidebarItems } = useSidebarItems();
const isOpenAlbumEditModal = ref(false);
const activeClasses = ref(['!border-0', '!bg-gradient-to-b', '!my-thin-shadow']);

const dropdownDots = ref(null);

// computed----->
const sizeWithMB = computed(() => {
  if (props.album.photos_sum_size >= 1024 * 1024) {
    return (props.album.photos_sum_size / (1024 * 1024)).toFixed(1) + ' MB';
  } else {
    return Math.round((props.album.photos_sum_size / 1024)) + ' KB';
  }
});

// functions----->
function calculateDate (date) {
  return useDateFormat(date, 'MMM D, YYYY').value;
}

const handleClickOutside = (event) => {
  if (!dropdownDots.value?.contains(event.target)) {
    emit('changeShowAlbumDotsId', null);
  }
};

const editAlbum = (newAlbum) => {
  updateAlbum(props.album.id, newAlbum);
  isOpenAlbumEditModal.value = !isOpenAlbumEditModal.value;
  changeItemDetail(newAlbum, 'album');
};

const openAlbum = (albumId) => {
  new Promise((resolve, reject) => {
    router['get'](route('business.albums.show', albumId));
  });
};

const editAlbumDetail = () => {
  isOpenAlbumEditModal.value = !isOpenAlbumEditModal.value;
};

const shortText = (text) => {
  if (text?.length > 25) {
    return text.substring(0, 25);
  }
  return text;
};
onMounted(() => document.addEventListener('mousedown', handleClickOutside));
</script>
