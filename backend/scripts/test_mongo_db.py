from pymongo import MongoClient
import pymongo
# Connect to MongoDB
client = MongoClient("mongodb://root:example@localhost:27017/")

# Access a database
db = client.test_db

# Create a collection
collection = db.test_collection

# Insert a document
document = {"name": "Alice", "age": 25, "city": "New York"}
insert_result = collection.insert_one(document)
print(f"Inserted document ID: {insert_result.inserted_id}")
# Retrieve and print the document
retrieved_doc = collection.find_one(insert_result.inserted_id)
print("Retrieved Document:", retrieved_doc)
db.runCommand({"compact": "my_expiring_data"})