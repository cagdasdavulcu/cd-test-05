import * as React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import { CdTest05MessageExtensionConfig } from "../CdTest05MessageExtensionConfig";

describe("CdTest05MessageExtensionConfig Component", () => {
    // Snapshot Test Sample
    it("should match the snapshot", () => {
        const wrapper = shallow(<CdTest05MessageExtensionConfig />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    // Component Test Sample
    it("should render the tab", () => {
        const component = shallow(<CdTest05MessageExtensionConfig />);
        const divResult = component.containsMatchingElement(<div>cd test 05 Message Extension configuration</div>);

        expect(divResult).toBeTruthy();
    });
});


