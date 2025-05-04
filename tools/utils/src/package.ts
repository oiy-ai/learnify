import { readFileSync } from 'node:fs';
import { parse } from 'node:path';

import { type Path, ProjectRoot } from './path';
import type { CommonPackageJsonContent, YarnWorkspaceItem } from './types';
import type { Workspace } from './workspace';
import { PackageList, type PackageName } from './yarn';

export function readPackageJson(path: Path): CommonPackageJsonContent {
  const content = readFileSync(path.join('package.json').toString(), 'utf-8');

  return JSON.parse(content);
}

export class Package {
  readonly name: PackageName;
  readonly packageJson: CommonPackageJsonContent;
  readonly dirname: string;
  readonly path: Path;
  readonly srcPath: Path;
  readonly nodeModulesPath: Path;
  readonly libPath: Path;
  readonly distPath: Path;
  readonly version: string;
  readonly isTsProject: boolean;
  readonly workspaceDependencies: string[];
  readonly deps: Package[] = [];
  private _workspace: Workspace | null = null;

  get entry() {
    return this.packageJson.main || this.packageJson.exports?.['.'];
  }

  get dependencies() {
    return this.packageJson.dependencies || {};
  }

  get devDependencies() {
    return this.packageJson.devDependencies || {};
  }

  get workspace() {
    if (!this._workspace) {
      throw new Error('Workspace is not initialized');
    }

    return this._workspace;
  }

  private set workspace(workspace: Workspace) {
    this._workspace = workspace;
  }

  constructor(name: PackageName, meta?: YarnWorkspaceItem) {
    this.name = name as PackageName;
    meta ??= PackageList.find(item => item.name === name)!;

    // parse paths
    this.path = ProjectRoot.join(meta.location);
    this.dirname = parse(meta.location).name;
    this.srcPath = this.path.join('src');
    this.libPath = this.path.join('lib');
    this.distPath = this.path.join('dist');
    this.nodeModulesPath = this.path.join('node_modules');

    // parse workspace
    const packageJson = readPackageJson(this.path);
    this.packageJson = packageJson;
    this.version = packageJson.version;
    this.workspaceDependencies = meta.workspaceDependencies;
    this.isTsProject = this.path.join('tsconfig.json').isFile();
  }

  get scripts() {
    return this.packageJson.scripts || {};
  }

  join(...paths: string[]) {
    return this.path.join(...paths);
  }
}
