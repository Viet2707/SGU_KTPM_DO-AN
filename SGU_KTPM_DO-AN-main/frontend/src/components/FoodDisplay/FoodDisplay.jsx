import React, { useContext } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  console.log('food_list:', food_list);
  console.log('category:', category);

  // chuẩn hóa category
  const normalizedCategory = category ? category.trim().toLowerCase() : "all";

  // lọc sản phẩm
  const filteredList =
    normalizedCategory === "all"
      ? food_list
      : food_list.filter(item => item.category?.trim().toLowerCase() === normalizedCategory);

  return (
    <div className='food-display' id='food-display'>
      <h2>
        Danh sách cây {normalizedCategory === "all" ? "- Tất cả sản phẩm" : `- ${category}`}
      </h2>

      <div className='food-display-list'>
        {food_list && food_list.length > 0 ? (
          filteredList.length > 0 ? (
            filteredList.map(item => (
              <FoodItem
                key={item._id}
                image={item.image}
                name={item.name}
                desc={item.description}
                price={item.price}
                id={item._id}
              />
            ))
          ) : (
            <p>Không có sản phẩm nào thuộc loại này</p>
          )
        ) : (
          <p>Đang tải sản phẩm...</p>
        )}
      </div>
    </div>
  )
}

export default FoodDisplay
