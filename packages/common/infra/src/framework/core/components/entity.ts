import { Component } from './component';

export class Entity<Props = {}> extends Component<Props> {
  readonly __isEntity = true;
}
