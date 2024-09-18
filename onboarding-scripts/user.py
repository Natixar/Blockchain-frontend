import http.client
import json
import sys
import os
import curses

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

def retrieve_groups():
    connection = http.client.HTTPSConnection(BASE_URL)
    try:
        connection.request("GET", "/api/group", headers=headers)
        response = connection.getresponse()
        data = response.read()

        if response.status != 200:
            print(f"Failed to retrieve groups: {response.status} {response.reason}")
            return []

        groups = json.loads(data).get("groups", [])
        return groups
    except Exception as e:
        print(f"An error occurred while retrieving groups: {e}")
        return []
    finally:
        connection.close()

def display_filterable_list(stdscr, options):
    curses.curs_set(0)  # Hide cursor
    current_row = 0
    search_text = ""

    while True:
        stdscr.clear()
        stdscr.addstr(0, 0, "Type to filter, press Enter to select a group:")
        stdscr.addstr(1, 0, f"Filter: {search_text}")
        
        filtered_options = [opt for opt in options if search_text.lower() in opt['name'].lower()]
        if not filtered_options:
            stdscr.addstr(3, 0, "No results found.")
        else:
            for idx, option in enumerate(filtered_options):
                if idx == current_row:
                    # Use reverse video for highlighting
                    stdscr.attron(curses.A_REVERSE)
                    stdscr.addstr(3 + idx, 0, option['name'])
                    stdscr.attroff(curses.A_REVERSE)
                else:
                    stdscr.addstr(3 + idx, 0, option['name'])

        key = stdscr.getch()

        if key == curses.KEY_UP:
            current_row = (current_row - 1) % len(filtered_options)
        elif key == curses.KEY_DOWN:
            current_row = (current_row + 1) % len(filtered_options)
        elif key == curses.KEY_BACKSPACE or key == 127:
            search_text = search_text[:-1]
        elif key == curses.KEY_ENTER or key in [10, 13]:
            return filtered_options[current_row]['id']
        elif key == 27:  # ESC key
            return None
        else:
            search_text += chr(key)

        stdscr.refresh()

def create_user(email, first_name, last_name, group_id, application_id):
    connection = http.client.HTTPSConnection(BASE_URL)
    print(f"groupid: {group_id}")
    try:
        payload = {
            "registration": {
                "applicationId": application_id
            },
            "user": {
                "email": email,
                "firstName": first_name,
                "lastName": last_name,
                "registrations": [{
                        "applicationId": application_id
                }],
                "memberships": [{
                    "groupId": group_id
                }],
                "password": "natixar2024"
            },
            # "sendSetPasswordEmail": True,
        }
        json_payload = json.dumps(payload)

        connection.request("POST", "/api/user/registration/", body=json_payload, headers=headers)
        response = connection.getresponse()
        data = response.read()

        if response.status != 200:
            print(f"Failed to create user: {response.status} {response.reason}")
            print("Request Body:")
            print(json.dumps(payload, indent=2))

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

        user = json.loads(data)
        return user
    except Exception as e:
        print(f"An error occurred while creating the user: {e}")
        return None
    finally:
        connection.close()

def main():

    email = input("Enter the user's email: ").strip()
    first_name = input("Enter the user's first name: ").strip()
    last_name = input("Enter the user's last name: ").strip()

    if not email or not first_name or not last_name:
        print("All fields are required.")
        sys.exit(1)

    groups = retrieve_groups()
    if not groups:
        print("No groups available.")
        sys.exit(1)

    # Select group using curses
    group_id = curses.wrapper(display_filterable_list, groups)
    if not group_id:
        print("No group selected or operation canceled.")
        sys.exit(1)

    user = create_user(email, first_name, last_name, group_id, APPLICATION_ID)
    if user:
        print("User created successfully:")
        print(json.dumps(user, indent=2))
    else:
        print("Failed to create the user.")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)
