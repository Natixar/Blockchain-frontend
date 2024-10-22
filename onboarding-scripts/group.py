import http.client
import json
import sys
import os

BASE_URL = "auth2.natixar.pro"
API_KEY = os.getenv("FUSIONAUTH_API_KEY")
TENANT_ID = "d3bd01ce-a851-9ac1-556a-250094aca2de"
APPLICATION_ID = "0c2707b5-a830-435a-8c4d-7234d02d6aee"

if not API_KEY:
    print("Error: API key not found. Please set the FUSIONAUTH_API_KEY environment variable.")
    sys.exit(1)

headers = {
    "Authorization": API_KEY,
    "X-FusionAuth-TenantId": TENANT_ID,
    "Content-Type": "application/json"
}

def get_roles():
    connection = http.client.HTTPSConnection(BASE_URL)
    try:
        connection.request("GET", f"/api/application/{APPLICATION_ID}", headers=headers)
        response = connection.getresponse()

        if response.status != 200:
            print(f"Failed to retrieve roles: {response.status} {response.reason}")
            return None

        data = response.read()
        roles = json.loads(data).get('application', {}).get('roles', [])
        return roles
    except Exception as e:
        print(f"An error occurred while retrieving roles: {e}")
        return None
    finally:
        connection.close()

def create_group(name, blockchain_address, role_ids, email, group_id=None):
    connection = http.client.HTTPSConnection(BASE_URL)
    try:
        group_data = {
            "name": name,
            "data": {
                "blockchainAddress": blockchain_address,
                "email": email
            }
        }

        payload = {
            "group": group_data,
            "roleIds": role_ids
        }
        json_payload = json.dumps(payload)

        # Include groupId in the URL if specified
        url = f"/api/group/{group_id}" if group_id else "/api/group"

        connection.request("POST", url, body=json_payload, headers=headers)
        response = connection.getresponse()

        data = response.read()

        if response.status != 200:
            print(f"Failed to create group: {response.status} {response.reason}")

            # Print the request body for debugging
            print("Request Body:")
            print(json.dumps(payload, indent=2))

            # Attempt to log more details from the response
            try:
                errors = json.loads(data)
                print("Response JSON:")
                print(json.dumps(errors, indent=2))
                
                if 'generalErrors' in errors:
                    print("General Errors:")
                    for error in errors['generalErrors']:
                        print(f"- Code: {error.get('code')}, Message: {error.get('message')}")
                
                if 'fieldErrors' in errors:
                    print("Field Errors:")
                    for field, field_errors in errors['fieldErrors'].items():
                        for field_error in field_errors:
                            print(f"- Field: {field}, Code: {field_error.get('code')}, Message: {field_error.get('message')}")

            except json.JSONDecodeError:
                print("Failed to decode response. Raw response data:")
                print(data.decode())

            return None

        group = json.loads(data)
        return group
    except Exception as e:
        print(f"An error occurred while creating the group: {e}")
        return None
    finally:
        connection.close()

def select_roles(roles):
    print("Please select the roles you want to assign to the group:")
    selected_role_ids = []
    for i, role in enumerate(roles):
        print(f"{i+1}. {role['name']}")
    selected_indices = input("Enter the numbers corresponding to the roles (comma-separated): ")

    try:
        selected_indices = [int(index.strip()) - 1 for index in selected_indices.split(",")]
        for index in selected_indices:
            if index < 0 or index >= len(roles):
                raise ValueError("Invalid role selection.")
            selected_role_ids.append(roles[index]["id"])
    except ValueError as ve:
        print(f"Input error: {ve}")
        sys.exit(1)

    return selected_role_ids

def main():

    group_name = input("Enter the group name: ").strip()
    if not group_name:
        print("Group name cannot be empty.")
        sys.exit(1)

    blockchain_address = input("Enter the blockchain address: ").strip()
    if not blockchain_address:
        print("Blockchain address cannot be empty.")
        sys.exit(1)

    # Get the email
    email = input("Enter the email: ").strip()
    if not email:
        print("Email cannot be empty.")
        sys.exit(1)

    # Optional: Get a custom group ID
    group_id = input("Enter the group ID (leave empty to auto-generate): ").strip() or None

    roles = get_roles()
    if not roles:
        print("No roles found for the application.")
        sys.exit(1)

    selected_role_ids = select_roles(roles)
    if not selected_role_ids:
        print("No roles selected.")
        sys.exit(1)

    group = create_group(group_name, blockchain_address, selected_role_ids, email, group_id)
    if group:
        print("Group created successfully:", json.dumps(group, indent=2))
    else:
        print("Failed to create the group.")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)
