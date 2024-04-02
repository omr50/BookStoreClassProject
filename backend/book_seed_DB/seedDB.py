# import csv
# import psycopg2
# import random

# # Database connection details
# DB_HOST = "localhost"
# DB_NAME = "postgres"
# DB_USER = "postgres"
# DB_PASSWORD = "example"
# DB_PORT = 5432

# # List of possible genres (you may not need this if genres are included in your new dataset)
# GENRES = [
#     "Fiction", "Non-Fiction", "Mystery", "Thriller", "Romance",
#     "Science Fiction", "Fantasy", "Biography", "History", "Self-Help"
# ]

# # Connect to the database
# conn = psycopg2.connect(
#     host=DB_HOST,
#     database=DB_NAME,
#     user=DB_USER,
#     password=DB_PASSWORD,
#     port=DB_PORT
# )

# # Create a cursor object
# cursor = conn.cursor()

# # Open the CSV file
# with open('./books_data/data.csv', 'r', encoding='utf-8') as file:
#     csvreader = csv.reader(file, delimiter=',')  # Updated delimiter to ','
    
#     # Skip the header row
#     next(csvreader)
#     counter = 1 
#     # Iterate over the rows in the CSV file
#     for row in csvreader:
#         try:
#             # Unpack the row
#             isbn13, isbn10, title, subtitle, authors, categories, thumbnail, description, published_year, average_rating, num_pages, ratings_count = row
            
#             # If you still need to randomly assign a genre, you can keep this line
#             genre = random.choice(GENRES)
            
#             # Adjust the insert query and values to match your database schema and the data you need
#             insert_query = "INSERT INTO books (ISBN, title, author, pubyear, genre, thumbnail) VALUES (%s, %s, %s, %s, %s, %s)"
#             values = (isbn13, title, authors, published_year, genre, thumbnail)
            
#             cursor.execute(insert_query, values)
#             counter += 1
#         except Exception as e:
#             print("Issue with row:", row)
#             print(f"Error inserting data: {e}")
#             conn.rollback()  # Rollback in case of error
#             continue

#         # Commit changes after every 1000 inserts to manage large transactions
#         if counter % 1000 == 0:
#             conn.commit()

# # Commit any remaining changes
# conn.commit()

# # Close the database connection
# cursor.close()
# conn.close()
# print("Data has been inserted into the books table.")

import csv
import psycopg2
import random

# Database connection details
DB_HOST = "localhost"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "example"
DB_PORT = 5432

# List of possible genres
GENRES = [
    "Fiction", "Non-Fiction", "Mystery", "Thriller", "Romance",
    "Science Fiction", "Fantasy", "Biography", "History", "Self-Help"
]

# Connect to the database
conn = psycopg2.connect(
    host=DB_HOST,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    port=DB_PORT
)

# Create a cursor object
cursor = conn.cursor()

# Open the CSV file
with open('./books_data/books.csv', 'r', encoding='latin-1') as file:
    # quotechar is for quotes so that no issues happen when there are quotes
    # It won't be ambiguous.
    csvreader = csv.reader(file, delimiter=';', quotechar='"')
    
    # Skip the header row
    next(csvreader)
    counter = 1 
    # Iterate over the rows in the CSV file
    for row in csvreader:
        try:
            # print(row)
            isbn, title, author, pubyear, publisher, urls, urlm, urll = row
            
            # Assign a random genre
            genre = random.choice(GENRES)
            
            # Insert data into the books table
            insert_query = "INSERT INTO books (ISBN, title, author, pubyear, thumbnail, genre) VALUES (%s, %s, %s, %s, %s, %s)"
            values = (isbn, title, author, pubyear, urll, genre)
            
            cursor.execute(insert_query, values)
            counter += 1
        except Exception as e:
            print("THE ROW HAAS VALUES", row)
            print(f"Error inserting data: {e}")
            conn.rollback()
            continue

        # Commit the changes
        if counter % 1000 == 0:
            print("REACHED THE NEXT THOUSAND", counter)
            conn.commit()

# Close the database connection
cursor.close()
conn.close()
print("Data has been inserted into the books table.")




