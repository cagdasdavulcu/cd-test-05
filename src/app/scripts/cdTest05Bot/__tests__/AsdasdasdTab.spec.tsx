import * as React from "react";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";

import { AsdasdasdTab } from "../AsdasdasdTab";

describe("Asdasdasd Component", () => {
    // Snapshot Test Sample
    it("should match the snapshot", () => {
        const wrapper = shallow(<AsdasdasdTab />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    // Component Test Sample
    it("should render the tab", () => {
        const component = shallow(<AsdasdasdTab />);
        const divResult = component.containsMatchingElement(<div>Welcome to the cd test 05 Bot bot page</div>);

        expect(divResult).toBeTruthy();
    });
});
