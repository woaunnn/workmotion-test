import { createRouter, createWebHistory } from 'vue-router'
import ProductList from '@/views/product/ProductList.vue'
import ProductForm from '@/views/product/ProductForm.vue'
import CategoryList from '@/views/category/CategoryList.vue'
import CategoryForm from '@/views/category/CategoryForm.vue'

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
