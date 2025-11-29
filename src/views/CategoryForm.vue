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
            label="ชื่อหมวดหมู่"
            :error-messages="errors.name"
            required
            prepend-icon="mdi-tag"
            variant="outlined"
          ></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn color="primary" @click="handleSubmit" prepend-icon="mdi-content-save">
          {{ isEdit ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่" }}
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
const loading = ref(true);
const isEdit = computed(() => id && id !== "new");
const form = ref({
  name: "",
});
const errors = ref({
  name: "",
});
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const breadcrumbItems = [
  {
    title: "รายการหมวดหมู่",
    disabled: false,
    href: "/categories",
  },
  {
    title: isEdit.value ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่",
    disabled: true,
  },
];

const getCategory = async () => {
  try {
    loading.value = true;
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/category/${id}`);
    if (res.data) {
      form.value = { ...res.data.item };
    } else {
      router.push("/categories");
    }
  } catch (error) {
    console.error("Error loading category:", error);
    router.push("/categories");
  } finally {
    loading.value = false;
  }
};

const validateForm = () => {
  errors.value = {
    name: "",
  };

  let isValid = true;

  if (!form.value.name || form.value.name.trim() === "") {
    errors.value.name = "กรุณากรอกชื่อหมวดหมู่";
    isValid = false;
  }

  return isValid;
};

const saveCategory = async () => {
  try {
    loading.value = true;
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/category/${id}`, {
      name: form.value.name,
    });
    return res.data.item;
  } catch (error) {
    console.error("Error saving category:", error);
    if (
      error.response?.status === 400 &&
      error.response?.data?.message === "Category already exists"
    ) {
      throw new Error("หมวดหมู่นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น");
    }
    throw error;
  } finally {
    loading.value = false;
  }
};

const createCategory = async () => {
  try {
    loading.value = true;
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/category`, {
      name: form.value.name,
    });
    return res.data.item;
  } catch (error) {
    console.error("Error creating category:", error);
    if (
      error.response?.status === 400 &&
      error.response?.data?.message === "Category already exists"
    ) {
      throw new Error("หมวดหมู่นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น");
    }
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
      form.value = await saveCategory();
    } else {
      await createCategory();
      router.push("/categories");
    }
    snackbar.value = {
      show: true,
      message: `${isEdit.value ? "แก้ไข" : "เพิ่ม"}หมวดหมู่เรียบร้อยแล้ว`,
      color: "success",
    };
  } catch (error) {
    console.error("Error saving category:", error);

    let errorMessage = `เกิดข้อผิดพลาดในการ${isEdit.value ? "แก้ไข" : "เพิ่ม"}หมวดหมู่`;
    if (error.message) {
      errorMessage = error.message;
    }

    snackbar.value = {
      show: true,
      message: errorMessage,
      color: "error",
    };

    if (isEdit.value) {
      getCategory();
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (isEdit.value) {
    getCategory();
  }
});
</script>
