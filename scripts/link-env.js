const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');
const packages = ['server', 'webapp'];
const envFile = path.join(rootDir, '.env');

// Check if root .env file exists
if (!fs.existsSync(envFile)) {
  console.error('Root .env file not found. Please create one first.');
  process.exit(1);
}

// Create symlinks for each package
packages.forEach(pkg => {
  const packageDir = path.join(packagesDir, pkg);
  const packageEnvFile = path.join(packageDir, '.env');
  
  // Remove existing .env file or symlink in package directory
  if (fs.existsSync(packageEnvFile)) {
    try {
      fs.unlinkSync(packageEnvFile);
      console.log(`Removed existing .env file in ${pkg} package`);
    } catch (error) {
      console.error(`Error removing existing .env in ${pkg} package:`, error);
      return;
    }
  }
  
  try {
    // Create relative path for symlink
    const relativePath = path.relative(packageDir, envFile);
    
    // Create symlink
    fs.symlinkSync(relativePath, packageEnvFile, 'file');
    console.log(`Created symlink for .env in ${pkg} package`);
  } catch (error) {
    console.log(`Symlink creation failed for ${pkg} package, copying file instead...`);
    
    // If symlink creation fails (common on Windows), copy the file instead
    try {
      fs.copyFileSync(envFile, packageEnvFile);
      console.log(`Created copy of .env in ${pkg} package`);
    } catch (copyError) {
      console.error(`Error copying .env to ${pkg} package:`, copyError);
    }
  }
});

console.log('Environment setup complete!'); 