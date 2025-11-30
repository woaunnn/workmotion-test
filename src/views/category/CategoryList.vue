<template>
  <div>
    <v-row class="mb-2">
      <v-col cols="12" class="d-flex justify-space-between align-center mb-2">
        <h1 class="text-h4">รายการหมวดหมู่</h1>
        <v-btn color="primary" :to="'/categories/new'" prepend-icon="mdi-plus">
          เพิ่มหมวดหมู่ใหม่
        </v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="ค้นหาชื่อหมวดหมู่"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          @keyup.enter="handleSearch"
          @click:prepend-inner="handleSearch"
          @click:clear="clearSearch"
        ></v-text-field>
      </v-col>
    </v-row>

    <div v-if="loading" class="d-flex justify-center align-center my-8">
      <v-progress-circular indeterminate color="primary" size="64">Loading</v-progress-circular>
    </div>

    <v-card v-else>
      <v-data-table
        :headers="headers"
        :items="categories"
        :items-per-page="limit"
        :items-length="totalItems"
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
          <v-alert type="info" class="ma-4">
            {{ true ? "ไม่พบข้อมูลที่ค้นหา" : "ไม่มีข้อมูลหมวดหมู่" }}
          </v-alert>
        </template>

        <template v-slot:bottom>
          <div class="d-flex justify-space-between align-center pa-4">
            <div class="text-subtitle-2">
              แสดง {{ (currentPage - 1) * limit + 1 }}-{{
                Math.min(currentPage * limit, totalItems)
              }}
              จาก {{ totalItems }} รายการ
            </div>
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
              @update:modelValue="onPageChange"
            ></v-pagination>
          </div>
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
const search = ref("");
const currentPage = ref(1);
const limit = ref(10);
const totalPages = ref();
const totalItems = ref(0);
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

const handleSearch = () => {
  currentPage.value = 1;
  getCategories();
};

const onPageChange = (page) => {
  currentPage.value = page;
  getCategories();
};

const clearSearch = () => {
  search.value = "";
  currentPage.value = 1;
};

const setSnackbar = (message, color = "success") => {
  snackbar.value = {
    show: true,
    message,
    color,
  };
};

const getCategories = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`, {
      params: {
        search: search.value || "",
        limit: limit.value,
        page: currentPage.value,
      },
    });
    categories.value = res?.data?.items || [];
    totalItems.value = res?.data?.total || 0;
    totalPages.value = Math.ceil(res?.data?.total / limit.value);
  } catch (error) {
    console.error("Error loading categories:", error);
    setSnackbar("เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่", "error");
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/category/${id}`);
    setSnackbar("ลบหมวดหมู่เรียบร้อยแล้ว", "success");
    getCategories();
  } catch (error) {
    console.error("Error deleting category:", error);
    setSnackbar(error.response?.data?.message || "เกิดข้อผิดพลาดในการลบหมวดหมู่", "error");
  }
};

onMounted(() => {
  getCategories();
});
</script>
