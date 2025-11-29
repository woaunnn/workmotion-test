import { createRouter, createWebHistory } from 'vue-router'

// Product views
import ProductList from '@/views/ProductList.vue'
import ProductForm from '@/views/ProductForm.vue'

// Category views
import CategoryList from '@/views/CategoryList.vue'
import CategoryForm from '@/views/CategoryForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/products',
    },
    {
      path: '/products',
      name: 'ProductList',
      component: ProductList,
    },
    {
      path: '/products/new',
      name: 'ProductCreate',
      component: ProductForm,
    },
    {
      path: '/products/:id/edit',
      name: 'ProductEdit',
      component: ProductForm,
    },
    {
      path: '/categories',
      name: 'CategoryList',
      component: CategoryList,
    },
    {
      path: '/categories/new',
      name: 'CategoryCreate',
      component: CategoryForm,
    },
    {
      path: '/categories/:id/edit',
      name: 'CategoryEdit',
      component: CategoryForm,
    },
  ],
})

export default router
