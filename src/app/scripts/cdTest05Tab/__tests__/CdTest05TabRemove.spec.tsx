import * as React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import { CdTest05TabRemove } from "../CdTest05TabRemove";

describe("CdTest05TabRemove Component", () => {
    // Snapshot Test Sample
    it("should match the snapshot", () => {
        const wrapper = shallow(<CdTest05TabRemove />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    // Component Test Sample
    it("should render the tab", () => {
        const component = shallow(<CdTest05TabRemove />);
        const divResult = component.containsMatchingElement(<div>You"re about to remove your tab...</div>);

        expect(divResult).toBeTruthy();
    });
});
