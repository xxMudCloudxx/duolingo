import { Edit, required, SimpleForm, TextInput } from "react-admin";

export const CourseEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="id" label="Id" validate={required()} />
        <TextInput source="title" label="Title" validate={required()} />
        <TextInput source="imgSrc" label="Image" validate={required()} />
      </SimpleForm>
    </Edit>
  );
};
