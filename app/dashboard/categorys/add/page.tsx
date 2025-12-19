import CategoryForm from '@/components/dashboard/forms/CategoryForm'
import React from 'react'

export default function AddCategory() {
  return (
    <>
    <CategoryForm
      formType="ADD"
      defaultValues={{
        name: "",
      }}
      categories={[
        { _id: "69444958d641c54e31ed9b09", name: "Men's Clothing" },
        { _id: "cat-2", name: "Women's Clothing" },
        { _id: "cat-3", name: "Kids" },
        { _id: "cat-4", name: "Shoes" },
        { _id: "cat-5", name: "Bags & Backpacks" },
        { _id: "cat-6", name: "Watches" },
        { _id: "cat-7", name: "Jewelry" },
        { _id: "cat-8", name: "Sportswear" },
        { _id: "cat-9", name: "Formal Wear" },
        { _id: "cat-10", name: "Casual Wear" },
        { _id: "cat-11", name: "Winter Collection" },
        { _id: "cat-12", name: "Summer Collection" },
      ]}
    />
  </>
  )
}
