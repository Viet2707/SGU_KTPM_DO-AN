
--- [2025-12-10 15:15:00] categoryController ---
1. should return an empty array if no categories exist
2. should return a list of categories
3. should return a list of categories from /api/category/list endpoint
4. should return 500 if an unexpected server error occurs during fetching categories
5. should create a new category successfully
6. should return an error message if category name is an empty string
7. should return an error message if category name is missing from the request body
8. should return 500 if an unexpected server error occurs during category creation
9. should update an existing category successfully
10. should update an existing category with an empty name if schema allows
11. should return an error if category to update is not found
12. should return 500 if the ID is invalid (malformed) for update
13. should return 500 if an unexpected server error occurs during category update
14. should delete an existing category successfully
15. should return an error if category to delete is not found
16. should return 500 if the ID is invalid (malformed) for delete
17. should return 500 if an unexpected server error occurs during category deletion


--- [12/10/2025, 3:28:08 PM] categoryController ---
1. should return an empty array if no categories exist
2. should return a list of categories when they exist (GET /)
3. should return a list of categories when they exist (GET /list)
4. should create a new category successfully with valid data
5. should return an error if 
6. should return an error if 
7. should update an existing category successfully
8. should return an error if category ID is not found
9. should return a 500 error if ID format is invalid
10. should allow updating category name to an empty string
11. should delete an existing category successfully
12. should return an error if category ID is not found during deletion
13. should return a 500 error if ID format is invalid during deletion


--- [12/10/2025, 3:29:52 PM] cartController ---
1. should add a new item to an empty cart successfully
2. should increment quantity for an existing item in the cart successfully
3. should add a new item when other items already exist in the cart
4. should return error if user does not exist
5. should return error if userId is missing from request body
6. should return error if itemId is missing from request body
7. should handle internal server errors during database operations
8. should decrement quantity for an existing item successfully
9. should decrement quantity to zero for an item that only had one
10. should not decrement if item quantity is already zero or less
11. should not error if item is not in cart (quantity remains undefined)
12. should return error if user does not exist
13. should return error if userId is missing from request body
14. should return success even if itemId is missing, but no change in cart
15. should handle internal server errors during database operations
16. should return cart data for a user with items successfully
17. should return an empty cart for a user with no items
18. should return error if user does not exist
19. should return error if userId is missing from request body
20. should handle internal server errors during database operations


--- [12/12/2025, 1:55:09 PM] categoryController ---
1. Should return a list of categories
2. Should return an empty list when no categories exist
3. Should handle errors and return 500
4. Should return a list of categories (duplicate route)
5. Should create a new category successfully
6. Should return an error if the category name is missing
7. Should handle errors during category creation
8. Should update an existing category successfully
9. Should return an error if the category is not found
10. Should handle errors during category update
11. Should delete an existing category successfully
12. Should return an error if the category is not found for deletion
13. Should handle errors during category deletion
