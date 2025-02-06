
# ngx-orphan-cleaner

A CLI tool to find unused variables and methods in Angular components.
Currently, it has the ability to remove unused variables using the `remove` command.

## Installation

```sh
npm install -g ngx-orphan-cleaner
```

## Usage

```sh
ngx-orphan-cleaner <command> [directory-path]
```

### Commands

| Command | Description |
|---------|-------------|
| `find [directory-path]` | Finds unused class members in Angular components. |
| `remove [directory-path]` | Removes unused class members from Angular components. |
| `--help` | Displays help information. |

### Options

- `[directory-path]` is **optional**. If not provided, the tool will run in the **current working directory**.

## Examples

```sh
# Find unused members in the current directory
ngx-orphan-cleaner find

# Remove unused members in the current directory
ngx-orphan-cleaner remove

# Find unused members in a specific directory
ngx-orphan-cleaner find ./src/app/components

# Remove unused members in a specific directory
ngx-orphan-cleaner remove ./src/app/components

# Show help information
ngx-orphan-cleaner --help
```

## License

This project is licensed under the MIT License.