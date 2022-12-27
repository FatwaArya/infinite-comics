import { useState } from "react";
import { Combobox } from "@headlessui/react";

const people = [
  { id: 1, name: "Durward Reynolds" },
  { id: 2, name: "Kenton Towne" },
  { id: 3, name: "Therese Wunsch" },
  { id: 4, name: "Benedict Kessler" },
  { id: 5, name: "Katelyn Rohan" },
];

interface People {
  id: number;
  name: string;
}

function Example() {
  const [query, setQuery] = useState("");

  const filteredPeople =
    query === ""
      ? people
      : people.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <form action="/projects/1/assignee" method="post">
      <Combobox name="assignee" defaultValue={people[0]}>
        <Combobox.Input
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(person: People) => person.name}
        />
        <Combobox.Options>
          {filteredPeople.map((person) => (
            <Combobox.Option key={person.id} value={person}>
              {person.name}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
      <button>Submit</button>
    </form>
  );
}

export default Example;
