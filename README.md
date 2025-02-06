
# ngx-orphan-classmember-remover

A CLI tool to find and remove unused class members from Angular components.

## Installation

```sh
npm install -g ngx-orphan-classmember-remover
```

## Usage

```sh
unused-members <command> [directory-path]
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
unused-members find

# Remove unused members in the current directory
unused-members remove

# Find unused members in a specific directory
unused-members find ./src/app/components

# Remove unused members in a specific directory
unused-members remove ./src/app/components

# Show help information
unused-members --help
```

## License

This project is licensed under the MIT License.