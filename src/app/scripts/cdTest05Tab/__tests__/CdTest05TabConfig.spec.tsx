import * as React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import { CdTest05TabConfig } from "../CdTest05TabConfig";

describe("CdTest05TabConfig Component", () => {
    // Snapshot Test Sample
    it("should match the snapshot", () => {
        const wrapper = shallow(<CdTest05TabConfig />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    // Component Test Sample
    it("should render the tab", () => {
        const component = shallow(<CdTest05TabConfig />);
        const divResult = component.containsMatchingElement(<div>Configure your tab</div>);

        expect(divResult).toBeTruthy();
    });
});
