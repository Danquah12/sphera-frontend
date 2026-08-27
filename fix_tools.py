import sys

with open('app.js.broken', 'r') as f:
    lines = f.readlines()

# Extract from line 19495 to 19788 (inclusive)
new_code = "".join(lines[19495-1:19788])

with open('app.js', 'r') as f:
    app_lines = f.readlines()

# Find the start of openSettings in app.js
start_idx = -1
end_idx = -1
for i, line in enumerate(app_lines):
    if "function openSettings(section) {" in line:
        # Go a few lines up to replace precisely where we need
        start_idx = i - 1
    if start_idx != -1 and "function showHelp() {" in line:
        end_idx = i - 1
        break

if start_idx != -1 and end_idx != -1:
    with open('app.js', 'w') as f:
        f.writelines(app_lines[:start_idx])
        f.write(new_code + "\n")
        f.writelines(app_lines[end_idx:])
    print(f"Successfully replaced lines {start_idx} to {end_idx} in app.js")
else:
    print("Failed to find boundaries in app.js")
