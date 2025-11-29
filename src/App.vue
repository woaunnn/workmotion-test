<script setup>
import { ref } from "vue";

const drawer = ref(false);
</script>

<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title class="text-h5 font-weight-bold"> ระบบจัดการสินค้า </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn :to="'/products'" text class="mx-2">
        <v-icon start>mdi-package-variant</v-icon>
        สินค้า
      </v-btn>

      <v-btn :to="'/categories'" text class="mx-2">
        <v-icon start>mdi-shape</v-icon>
        หมวดหมู่
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item prepend-icon="mdi-package-variant" title="สินค้า" to="/products"></v-list-item>

        <v-list-item prepend-icon="mdi-shape" title="หมวดหมู่" to="/categories"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<style></style>
