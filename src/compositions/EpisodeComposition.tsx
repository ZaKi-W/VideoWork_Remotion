import type {EpisodeInputProps} from '../editorial/schema/episode.types';
import {EpisodeRenderer} from '../editorial/renderer/EpisodeRenderer';

export const EpisodeComposition = (props: EpisodeInputProps) => {
  return <EpisodeRenderer {...props} />;
};
