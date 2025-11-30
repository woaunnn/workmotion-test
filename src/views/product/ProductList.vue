<template>
  <div>
    <v-row class="mb-2">
      <v-col cols="12" class="d-flex justify-space-between align-center mb-2">
        <h1 class="text-h4">รายการสินค้า</h1>
        <v-btn color="primary" :to="'/products/new'" prepend-icon="mdi-plus">
          เพิ่มสินค้าใหม่
        </v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="ค้นหาชื่อสินค้า"
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
        :items="products"
        :items-per-page="limit"
        :items-length="totalItems"
        class="elevation-1"
      >
        <template v-slot:[`item.price`]="{ item }">
          <span>{{ formatPrice(item.price) }}</span>
        </template>

        <template v-slot:[`item.category`]="{ item }">
          <v-chip color="primary" size="small">
            {{ mappingCategories[item.categoryId] || "-" }}
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            size="small"
            color="success"
            :to="`/products/${item._id}/edit`"
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
            {{ true ? "ไม่พบข้อมูลที่ค้นหา" : "ไม่มีข้อมูลสินค้า" }}
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

const products = ref([]);
const loading = ref(true);
const mappingCategories = ref({});
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
  { title: "ชื่อสินค้า", key: "name", sortable: true },
  { title: "คำอธิบาย", key: "description", sortable: false },
  { title: "ราคา", key: "price", sortable: true },
  { title: "หมวดหมู่", key: "category", sortable: false },
  { title: "จัดการ", key: "actions", sortable: false, align: "center" },
];

const handleSearch = () => {
  currentPage.value = 1;
  getProducts();
};

const onPageChange = (page) => {
  currentPage.value = page;
  getProducts();
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
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
    const mapping = res?.data?.items.reduce((acc, category) => {
      acc[category._id] = category.name;
      return acc;
    }, {});
    mappingCategories.value = mapping;
  } catch (error) {
    console.error("Error loading categories:", error);
    setSnackbar("เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่", "error");
  } finally {
    loading.value = false;
  }
};

const getProducts = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
      params: {
        search: search.value || "",
        limit: limit.value,
        page: currentPage.value,
      },
    });
    products.value = res?.data?.items || [];
    totalItems.value = res?.data?.total || 0;
    totalPages.value = Math.ceil(res?.data?.total / limit.value);
  } catch (error) {
    console.error("Error loading products:", error);
    setSnackbar("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า", "error");
  } finally {
    loading.value = false;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(price);
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/product/${id}`);
    setSnackbar("ลบสินค้าเรียบร้อยแล้ว", "success");
    getProducts();
  } catch (error) {
    console.error("Error deleting product:", error);
    setSnackbar("เกิดข้อผิดพลาดในการลบสินค้า", "error");
  }
};

onMounted(() => {
  getCategories();
  getProducts();
});
</script>
