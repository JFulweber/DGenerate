import { JSONArr } from "./JSONArr";

export class GeneratorSettings {
    observation_json: object[];
    observation_map: Map<string, any>;
    variable_definitions_json_arr: JSONArr[];
    template_files: string[];
    output_name: string;
}