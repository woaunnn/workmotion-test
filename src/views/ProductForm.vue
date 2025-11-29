<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" class="mb-4">
      <template v-slot:divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>

    <div v-if="loading && isEdit" class="d-flex justify-center align-center my-8">
      <v-progress-circular indeterminate color="primary" size="64">Loading</v-progress-circular>
    </div>

    <v-card v-else class="mx-auto" max-width="800">
      <v-card-text>
        <v-form @submit.prevent="handleSubmit" ref="formRef">
          <v-text-field
            v-model="form.name"
            label="ชื่อสินค้า"
            :error-messages="errors.name"
            required
            prepend-icon="mdi-package-variant"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <v-textarea
            v-model="form.description"
            label="คำอธิบาย"
            :error-messages="errors.description"
            required
            prepend-icon="mdi-text"
            variant="outlined"
            rows="4"
            class="mb-4"
          ></v-textarea>

          <v-text-field
            v-model="form.price"
            label="ราคา (บาท)"
            :error-messages="errors.price"
            required
            type="number"
            step="0.01"
            min="0"
            prepend-icon="mdi-currency-usd"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <v-select
            v-model="form.categoryId"
            :items="categories"
            item-title="name"
            item-value="_id"
            label="หมวดหมู่"
            :error-messages="errors.categoryId"
            required
            prepend-icon="mdi-shape"
            variant="outlined"
          ></v-select>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn color="primary" @click="handleSubmit" prepend-icon="mdi-content-save">
          {{ isEdit ? "บันทึกการแก้ไข" : "เพิ่มสินค้า" }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const id = route?.params?.id || null;
const isEdit = computed(() => id && id !== "new");

const categories = ref([]);
const loading = ref(true);
const form = ref({
  name: "",
  description: "",
  price: "",
  categoryId: "",
});
const errors = ref({
  name: "",
  description: "",
  price: "",
  categoryId: "",
});
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const breadcrumbItems = [
  {
    title: "รายการสินค้า",
    disabled: false,
    href: "/products",
  },
  {
    title: isEdit.value ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่",
    disabled: true,
  },
];

const getCategories = async () => {
  try {
    const categoriesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
    categories.value = categoriesResponse.data.items || [];
  } catch (error) {
    console.error("Error loading categories:", error);
    snackbar.value = {
      show: true,
      message: "เกิดข้อผิดพลาดในการโหลดหมวดหมู่",
      color: "error",
    };
  }
};

const getProduct = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/product/${id}`);
    if (res.data) {
      form.value = { ...res.data.item };
    } else {
      router.push("/products");
    }
  } catch (error) {
    console.error("Error loading product:", error);
    router.push("/products");
  }
};

const validateForm = () => {
  errors.value = {
    name: "",
    description: "",
    price: "",
    categoryId: "",
  };

  let isValid = true;

  if (!form.value.name || form.value.name.trim() === "") {
    errors.value.name = "กรุณากรอกชื่อสินค้า";
    isValid = false;
  }

  if (!form.value.description || form.value.description.trim() === "") {
    errors.value.description = "กรุณากรอกคำอธิบาย";
    isValid = false;
  }

  if (!form.value.price || form.value.price <= 0) {
    errors.value.price = "กรุณากรอกราคาที่ถูกต้อง";
    isValid = false;
  }

  if (!form.value.categoryId) {
    errors.value.categoryId = "กรุณาเลือกหมวดหมู่";
    isValid = false;
  }

  return isValid;
};

const saveProduct = async () => {
  try {
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/product/${id}`, form.value);
    return res.data.item;
  } catch (error) {
    console.error("Error saving product:", error);
    throw error;
  } finally {
    loading.value = false;
  }
};

const createProduct = async () => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/product`, form.value);
    return res.data.item;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;
  try {
    if (isEdit.value) {
      const updatedProduct = await saveProduct();
      form.value = updatedProduct;
    } else {
      await createProduct();
      router.push("/products");
    }
    snackbar.value = {
      show: true,
      message: `${isEdit.value ? "แก้ไข" : "เพิ่ม"}สินค้าเรียบร้อยแล้ว`,
      color: "success",
    };
  } catch (error) {
    console.error("Error saving product:", error);
    snackbar.value = {
      show: true,
      message: `เกิดข้อผิดพลาดในการ${isEdit.value ? "แก้ไข" : "เพิ่ม"}สินค้า`,
      color: "error",
    };

    if (isEdit.value) {
      getProduct();
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  await getCategories();
  if (isEdit.value) {
    getProduct();
  }
  loading.value = false;
});
</script>
