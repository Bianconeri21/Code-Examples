<template>
  <div v-if="albumsStateError">On : Album List Error {{ albumsStateError }}</div>
  <div v-else-if="albumsData?.length">
    <p class="my-title my-4">MY ALBUMS</p>
    <div class="grid-container">
      <AlbumShape v-for="album in albumsData"
                  class="grid-item"
                  ref="albumsArea"
                  :key="album.id"
                  :album="album"
                  :show-album-dots-id="showAlbumDotsId"
                  :is-active="itemType === 'album' && itemDetailData?.id === album.id"
                  @changeShowAlbumDotsId="changeShowAlbumDotsId"/>
    </div>
  </div>
</template>

<script setup>
import AlbumShape from '@//Pages/Business/Albums/AlbumShape.vue';
import {ref, watch} from 'vue';
import {useInfiniteScroll} from '@vueuse/core';
import useScrollContainer from '@//Modules/Business/dashboard';
import useAlbums, {resetAlbumsState} from '@//Modules/Business/albums';
import useItemDetail from '@/Modules/Business/itemDetails';

const { albumsData, error: albumsStateError, editAlbum, loadAlbums } = useAlbums();
const { itemType, itemDetailData} = useItemDetail();
const albumsArea = ref(null);

let { value } = useScrollContainer();
const showAlbumDotsId = ref(null);

function changeShowAlbumDotsId (id) {
  showAlbumDotsId.value = id;
}

resetAlbumsState();

loadAlbums();

useInfiniteScroll(
  value,
  () => {
    loadAlbums();
  },
  {
    distance: 50
  }
);

watch(albumsData,
  () => {
    if (albumsData.value.length < 35) {
      loadAlbums();
    }
  },
  { deep: true }
);
</script>