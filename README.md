```markdown
# ngx-orphan-classmember-remover

A CLI tool to find and remove unused class members in Angular components.

## Features

- **Find unused class members**: Scans Angular components for orphaned (unused) class members.
- **Remove unused class members**: Automatically removes unused class members from Angular components.

## Installation

To install the package in your project, run:

```bash
npm install ngx-orphan-classmember-remover
```

## Usage

### CLI Commands

1. **Find unused class members:**
   Run the following command to scan for unused class members:

   ```bash
   npx ngx-orphan-classmember-remover find <directory-path>
   ```

   - `<directory-path>`: The path to the directory where your Angular components are located. If you don't specify a path, it will default to the current directory.

2. **Remove unused class members:**
   Run the following command to remove unused class members:

   ```bash
   npx ngx-orphan-classmember-remover remove <directory-path>
   ```

   - `<directory-path>`: The path to the directory where your Angular components are located. If you don't specify a path, it will default to the current directory.

### Example:

```bash
npx ngx-orphan-classmember-remover find ./src/app/components
npx ngx-orphan-classmember-remover remove ./src/app/components
```

## Development

### Set up the project

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/ngx-orphan-classmember-remover.git
cd ngx-orphan-classmember-remover
npm install
```

### Building the Library

1. Navigate to the project folder:

   ```bash
   cd projects/ngx-orphan-classmember-remover
   ```

2. Build the library:

   ```bash
   ng build ngx-orphan-classmember-remover
   ```

   This will generate the output in the `dist/ngx-orphan-classmember-remover` folder, which includes the `cli.js`, and other necessary files such as `public-api.d.ts`, `public-api.js`, etc.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Feel free to contribute to this project. Fork the repository, create a feature branch, and submit a pull request.

## Authors

- **Prashant Gour** - _Initial work_ - [prashantgour](https://github.com/prashantgour)
```