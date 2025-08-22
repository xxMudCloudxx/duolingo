import {
  Datagrid,
  List,
  NumberField,
  ReferenceField,
  TextField,
  useGetList,
  useListFilterContext,
} from "react-admin";
import {
  CoursesFilterList,
  UnitsFilterList,
} from "@/components/filiter-sidebar";

import { Card, CardContent } from "@mui/material";

const LessonFilterSidebar = () => {
  // 我们只需要 filterValues 来判断显示哪些列表
  const { filterValues } = useListFilterContext();

  const courseIds: number[] = filterValues.courseIds || [];

  const { data: courses } = useGetList("courses");

  const { data: units } = useGetList(
    "units",
    {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "id", order: "ASC" },
      filter: { courseIds: courseIds },
    },
    { enabled: courseIds.length > 0 }
  );

  return (
    <Card sx={{ order: -1, mr: 2, mt: 6, width: 250 }}>
      <CardContent>
        <CoursesFilterList courses={courses!} />

        {courseIds.length > 0 && units && <UnitsFilterList units={units} />}
      </CardContent>
    </Card>
  );
};
export const LessonList = () => {
  return (
    <List
      perPage={15}
      sort={{ field: "order", order: "ASC" }}
      aside={<LessonFilterSidebar />}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="title" />
        <ReferenceField source="unitId" reference="units" />
        <NumberField source="order" />
      </Datagrid>
    </List>
  );
};
