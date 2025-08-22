import {
  Datagrid,
  List,
  ReferenceField,
  TextField,
  useGetList,
} from "react-admin";
import { CoursesFilterList } from "@/components/filiter-sidebar";

import { Card, CardContent } from "@mui/material";

const UnitsFilterSidebar = () => {
  const { data: courses } = useGetList("courses");

  return (
    <Card sx={{ order: -1, mr: 2, mt: 6, width: 250 }}>
      <CardContent>
        <CoursesFilterList courses={courses!} />
      </CardContent>
    </Card>
  );
};
export const UnitList = () => {
  return (
    <List
      perPage={10}
      sort={{ field: "order", order: "ASC" }}
      aside={<UnitsFilterSidebar />}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="title" />
        <TextField source="description" />
        <ReferenceField source="courseId" reference="courses" />
        <TextField source="order" />
      </Datagrid>
    </List>
  );
};
