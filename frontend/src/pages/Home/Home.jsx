/* eslint-disable no-unused-vars */

import React, { useState } from 'react'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {
  const [category, setCategory] = useState('All')

  // ⬇️ thêm 2 state giá (để rỗng khi chưa nhập)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  return (
    <>
      <Header />
      <ExploreMenu
        category={category}
        setCategory={setCategory}
        // ⬇️ truyền props cho ô nhập giá
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />
      <FoodDisplay
        category={category}
        // ⬇️ truyền xuống để lọc theo giá
        minPrice={minPrice}
        maxPrice={maxPrice}
      />
      <AppDownload />
    </>
  )
}

export default Home
