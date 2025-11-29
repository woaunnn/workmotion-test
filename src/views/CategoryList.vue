<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">รายการหมวดหมู่</h1>
        <v-btn color="primary" :to="'/categories/new'" prepend-icon="mdi-plus">
          เพิ่มหมวดหมู่ใหม่
        </v-btn>
      </v-col>
    </v-row>

    <div v-if="loading" class="d-flex justify-center align-center my-8">
      <v-progress-circular indeterminate color="primary" size="64">Loading</v-progress-circular>
    </div>

    <v-card v-else>
      <v-data-table
        v-if="categories.length"
        :headers="headers"
        :items="categories"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            size="small"
            color="success"
            :to="`/categories/${item._id}/edit`"
            class="mr-2"
            prepend-icon="mdi-pencil"
            >Edit</v-btn
          >
          <v-btn
            size="small"
            color="error"
            @click="handleDelete(item._id)"
            prepend-icon="mdi-delete"
            >Delete</v-btn
          >
        </template>

        <template v-slot:no-data>
          <v-alert type="info" class="ma-4"> ไม่มีข้อมูลหมวดหมู่ </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const categories = ref([]);
const loading = ref(true);
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const headers = [
  { title: "รหัส", key: "_id", sortable: true },
  { title: "ชื่อหมวดหมู่", key: "name", sortable: true },
  { title: "จัดการ", key: "actions", sortable: false, align: "center" },
];

const getCategories = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
    categories.value = res?.data?.items || [];
  } catch (error) {
    console.error("Error loading categories:", error);
    snackbar.value = {
      show: true,
      message: "เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่",
      color: "error",
    };
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/category/${id}`);
    snackbar.value = {
      show: true,
      message: "ลบหมวดหมู่เรียบร้อยแล้ว",
      color: "success",
    };
    getCategories();
  } catch (error) {
    console.error("Error deleting category:", error);
    snackbar.value = {
      show: true,
      message: error.response?.data?.message || "เกิดข้อผิดพลาดในการลบหมวดหมู่",
      color: "error",
    };
  }
};

onMounted(() => {
  getCategories();
});
</script>
