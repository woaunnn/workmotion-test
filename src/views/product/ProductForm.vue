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
            :error-messages="v$.name.$errors.map((e) => e.$message)"
            required
            prepend-icon="mdi-package-variant"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <v-textarea
            v-model="form.description"
            label="คำอธิบาย"
            :error-messages="v$.description.$errors.map((e) => e.$message)"
            required
            prepend-icon="mdi-text"
            variant="outlined"
            rows="4"
            class="mb-4"
          ></v-textarea>

          <v-text-field
            v-model="form.price"
            label="ราคา (บาท)"
            :error-messages="v$.price.$errors.map((e) => e.$message)"
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
            :error-messages="v$.categoryId.$errors.map((e) => e.$message)"
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
import useVuelidate from "@vuelidate/core";
import { required, numeric, minValue, helpers } from "@vuelidate/validators";

const route = useRoute();
const router = useRouter();
const id = route?.params?.id || null;
const isEdit = computed(() => id && id !== "new");

const categories = ref([]);
const loading = ref(true);
const form = ref({
  name: "",
  description: "",
  price: 0,
  categoryId: "",
});
const rules = {
  name: {
    required: helpers.withMessage("กรุณากรอกชื่อสินค้า", required),
  },
  description: {
    required: helpers.withMessage("กรุณากรอกคำอธิบาย", required),
  },
  price: {
    required: helpers.withMessage("กรุณากรอกราคา", required),
    numeric: helpers.withMessage("ราคาต้องเป็นตัวเลข", numeric),
    minValue: helpers.withMessage("ราคาต้องมากกว่า 0", minValue(0.01)),
  },
  categoryId: {
    required: helpers.withMessage("กรุณาเลือกหมวดหมู่", required),
  },
};
const v$ = useVuelidate(rules, form);
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
    setSnackbar("เกิดข้อผิดพลาดในการโหลดหมวดหมู่", "error");
  }
};

const getProduct = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/product/${id}`);
    if (res.data) {
      const { name, description, price, categoryId } = res.data.item;
      const categoryExists = categories.value.some((c) => c._id === categoryId);

      form.value = {
        name,
        description,
        price,
        categoryId: categoryExists ? categoryId : null,
      };

      if (!categoryExists && categoryId) {
        setSnackbar("หมวดหมู่เดิมถูกลบไปแล้ว กรุณาเลือกหมวดหมู่ใหม่", "warning");
      }
    } else {
      router.push("/products");
    }
  } catch (error) {
    console.error("Error loading product:", error);
    router.push("/products");
  }
};

const validateForm = async () => {
  const result = await v$.value.$validate();
  return result;
};

const saveProduct = async () => {
  try {
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/product/${id}`, form.value);
    return res.data.item;
  } catch (error) {
    console.error("Error saving product:", error);
    if (
      error.response?.status === 400 &&
      error.response?.data?.message === "Product already exists"
    ) {
      throw new Error("สินค้านี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น");
    }
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
    if (
      error.response?.status === 400 &&
      error.response?.data?.message === "Product already exists"
    ) {
      throw new Error("สินค้านี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น");
    }
    throw error;
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  const isValid = await validateForm();
  if (!isValid) {
    return;
  }

  loading.value = true;
  try {
    if (isEdit.value) {
      const updatedProduct = await saveProduct();
      form.value = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        categoryId: updatedProduct.categoryId,
      };
    } else {
      await createProduct();
      router.push("/products");
    }
    setSnackbar(`${isEdit.value ? "แก้ไข" : "เพิ่ม"}สินค้าเรียบร้อยแล้ว`, "success");
  } catch (error) {
    let errorMessage = `เกิดข้อผิดพลาดในการ${isEdit.value ? "แก้ไข" : "เพิ่ม"}สินค้า`;
    console.error("Error saving product:", error);
    if (error.message) {
      errorMessage = error.message;
    }

    if (isEdit.value) {
      getProduct();
    }
    setSnackbar(errorMessage, "error");
  } finally {
    loading.value = false;
  }
};

const setSnackbar = (message, color = "success") => {
  snackbar.value = {
    show: true,
    message,
    color,
  };
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
