import {
  Edit,
  NumberInput,
  ReferenceInput,
  required,
  SimpleForm,
} from "react-admin";

export const LessonEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <NumberInput source="id" label="Id" validate={required()} />
        <ReferenceInput source="unitId" reference="units" />
        <NumberInput source="order" validate={required()} label="Order" />
      </SimpleForm>
    </Edit>
  );
};
