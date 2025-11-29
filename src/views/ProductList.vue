<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">รายการสินค้า</h1>
        <v-btn color="primary" :to="'/products/new'" prepend-icon="mdi-plus">
          เพิ่มสินค้าใหม่
        </v-btn>
      </v-col>
    </v-row>

    <div v-if="loading" class="d-flex justify-center align-center my-8">
      <v-progress-circular indeterminate color="primary" size="64">Loading</v-progress-circular>
    </div>

    <v-card v-else>
      <v-data-table :headers="headers" :items="products" :items-per-page="10" class="elevation-1">
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
          <v-alert type="info" class="ma-4"> ไม่มีข้อมูลสินค้า </v-alert>
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
// import { useRoute } from "vue-router";
import axios from "axios";

// const route = useRoute();
const products = ref([]);
const loading = ref(true);
const mappingCategories = ref({});

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
    snackbar.value = {
      show: true,
      message: "เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่",
      color: "error",
    };
  } finally {
    loading.value = false;
  }
};

const getProducts = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
    products.value = response?.data?.items || [];
  } catch (error) {
    console.error("Error loading products:", error);
    snackbar.value = {
      show: true,
      message: "เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า",
      color: "error",
    };
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
    snackbar.value = {
      show: true,
      message: "ลบสินค้าเรียบร้อยแล้ว",
      color: "success",
    };
    getProducts();
  } catch (error) {
    console.error("Error deleting product:", error);
    snackbar.value = {
      show: true,
      message: "เกิดข้อผิดพลาดในการลบสินค้า",
      color: "error",
    };
  }
};

onMounted(() => {
  getCategories();
  getProducts();
});

// watch(
//   () => route.path,
//   (newPath) => {
//     if (newPath === "/products") {
//       getProducts();
//     }
//   }
// );
</script>
