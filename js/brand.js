/*
  Reel Studio brand engine.
  Holds every brand kit (name, logo, colours, fonts, contact, industry), picks the active one,
  and gives both editors the same palette, fonts, logo drawing and text auto-fill.
  Kits are cached in this browser (localStorage) so every page can read them at once.
  With a save folder connected (rs-store.js, RS.fs), each kit is also a file: <folder>/brands/<id>.json.
  Export / import them from Settings to move them.
  Keep this file in the same folder as index.html, post.html and video.html.
*/
window.GIRIKA = (function(){
  /* built-in example brand: Girika Homes vector logo */
  const LOGO = {"mark_box": [47, 59, 1063, 1290], "word_box": [1306, 284, 2115, 913], "arch": "M48.6 1349.1C47.5 1347.4 48.0 564.2 49.0 549.5C62.2 364.7 171.9 200.2 338.1 116.0C395.2 87.0 456.0 69.2 524.0 61.3C546.1 58.7 613.6 58.8 635.5 61.3C721.4 71.4 797.5 98.2 868.0 143.2C995.7 224.7 1083.8 361.0 1105.0 509.8C1110.9 551.5 1110.5 518.9 1110.5 953.0L1110.5 1349.5L886.5 1349.8C763.3 1349.9 661.6 1349.8 660.4 1349.5C657.8 1348.9 650.9 1334.7 648.1 1324.0C640.3 1295.3 634.4 1242.2 632.0 1181.5C631.5 1167.2 630.8 1148.6 630.4 1140.2C629.7 1122.5 629.8 1122.4 638.4 1128.8C646.5 1134.9 659.8 1142.6 670.6 1147.4C680.9 1152.0 704.0 1159.7 708.8 1160.2C712.3 1160.6 712.2 1159.1 707.7 1147.5C701.8 1132.2 699.0 1117.5 699.0 1101.3C699.0 1090.3 699.3 1087.0 700.4 1086.0C702.0 1084.7 701.4 1083.9 712.4 1101.7C735.2 1138.7 764.1 1161.1 800.7 1170.4C817.0 1174.6 818.1 1174.2 814.1 1166.1C810.1 1158.1 805.4 1143.9 803.5 1133.9C801.8 1124.7 801.8 1105.5 803.5 1105.5C804.0 1105.5 806.1 1108.0 808.2 1111.0C825.9 1136.7 833.9 1146.0 846.3 1155.3C860.1 1165.7 876.7 1172.3 893.9 1174.1C902.4 1174.9 910.0 1174.6 912.2 1173.3C912.7 1173.1 908.8 1168.0 903.6 1162.1C890.1 1146.5 881.3 1131.5 876.4 1115.7C874.0 1107.8 875.1 1106.9 882.7 1110.3C885.9 1111.7 892.9 1114.0 898.2 1115.4C937.4 1125.6 971.3 1118.2 992.3 1094.9C999.9 1086.5 999.9 1084.5 992.2 1083.0C918.6 1068.2 842.6 1034.4 776.0 986.7C731.8 955.1 693.3 910.6 670.1 864.3C662.1 848.2 662.2 846.7 670.8 853.8C683.9 864.6 703.0 872.0 717.8 872.0L724.0 872.0L727.3 876.7C740.1 895.2 751.6 905.6 769.7 914.8C783.1 921.6 783.8 921.4 781.6 911.4C778.6 897.6 777.1 878.7 778.9 877.5C779.5 877.2 783.8 882.9 788.7 890.2C809.9 922.4 837.2 940.7 865.9 942.2C872.8 942.6 873.0 941.7 867.5 935.0C857.4 922.8 847.9 905.9 842.6 890.6C839.1 880.9 839.8 879.9 847.2 882.9C878.9 895.6 913.5 890.1 932.7 869.1C939.4 861.8 938.8 860.7 927.2 858.0C864.7 843.6 788.5 809.1 741.5 773.7C714.8 753.5 687.8 725.9 672.6 703.0C667.1 694.8 652.0 665.6 652.0 663.2C652.0 660.8 654.3 662.1 658.7 667.0C668.5 677.9 680.2 684.1 693.4 685.5L700.1 686.2L705.4 693.4C714.1 704.9 727.5 715.1 737.8 718.1C743.3 719.7 743.5 719.5 741.6 710.5C740.7 706.2 740.0 699.4 740.0 695.3C740.0 685.3 741.6 685.7 748.8 697.5C762.5 719.7 784.5 735.0 806.5 737.6C813.5 738.5 813.6 737.7 806.9 727.6C796.8 712.3 787.4 691.0 790.7 691.0C791.0 691.0 794.8 692.2 798.9 693.7C804.9 695.8 808.9 696.4 818.0 696.8C836.8 697.5 849.2 693.3 860.7 682.4C868.7 674.9 868.3 674.4 851.0 669.9C806.0 658.3 765.2 640.4 727.1 615.3C686.5 588.6 662.5 562.9 644.1 526.2C636.8 511.7 637.1 510.7 646.5 517.1C680.1 539.6 731.2 546.1 775.7 533.5C782.1 531.7 785.1 529.6 783.4 528.1C782.9 527.7 778.7 525.6 774.0 523.4C718.7 498.1 664.3 450.1 627.8 394.5C609.7 367.0 594.4 331.0 584.5 292.6C582.1 283.4 579.8 275.5 579.5 275.2C578.5 274.2 577.9 275.8 574.9 287.6C558.9 350.3 534.6 396.3 492.4 443.2C464.4 474.3 421.7 506.1 384.5 523.5C373.7 528.5 373.2 529.6 380.6 532.3C407.5 542.4 452.6 542.0 482.9 531.4C491.2 528.5 508.0 520.3 514.1 516.3C519.8 512.5 520.3 513.7 516.6 522.3C511.4 534.1 505.5 543.9 495.2 557.6C476.0 583.2 456.2 600.2 416.5 625.2C401.2 634.8 369.5 649.6 344.6 658.7C330.7 663.8 302.5 672.0 299.0 672.0C298.1 672.0 296.4 672.7 295.2 673.6C292.3 675.6 293.9 679.0 300.2 684.5C314.2 696.7 338.6 700.5 358.0 693.5C370.4 689.1 369.4 689.1 368.6 694.0C367.7 699.9 360.4 714.5 352.6 726.4C349.0 731.8 346.3 736.7 346.6 737.2C347.6 738.8 359.3 737.2 367.2 734.5C382.6 729.1 396.5 717.2 408.9 698.7C412.9 692.7 416.7 688.1 417.3 688.3C419.0 688.9 418.4 706.3 416.5 712.6C414.6 719.1 415.6 720.0 422.3 717.6C434.0 713.5 446.6 703.8 454.7 692.6C459.4 686.2 459.6 686.0 464.8 686.0C474.9 686.0 488.0 679.2 498.8 668.4C509.1 658.0 509.2 659.4 499.5 679.5C462.9 755.4 360.8 824.7 239.7 855.8C226.2 859.3 221.4 860.9 221.2 862.1C221.0 863.0 223.3 866.3 226.2 869.5C244.0 889.1 275.7 895.0 306.5 884.4C318.3 880.4 318.0 880.5 318.0 882.8C318.0 891.3 303.2 920.1 291.5 934.5C284.5 943.1 285.0 943.8 297.2 942.0C326.5 937.7 348.8 921.7 370.3 889.2C374.7 882.5 378.7 877.0 379.2 877.0C381.2 877.0 379.9 895.3 376.4 915.2C375.5 920.5 377.9 920.3 390.5 914.0C405.9 906.4 418.7 895.1 429.0 880.1L433.5 873.5L443.5 872.4C460.5 870.5 474.2 865.1 486.8 855.3C494.0 849.7 494.3 850.9 489.1 862.8C473.7 898.5 436.8 944.0 398.6 974.8C378.5 990.9 343.1 1013.9 316.5 1028.0C311.0 1030.9 304.5 1034.4 302.0 1035.8C294.0 1040.1 264.4 1053.3 251.5 1058.2C226.0 1067.9 193.3 1077.6 173.0 1081.5C157.0 1084.5 156.9 1085.0 168.8 1096.9C194.7 1123.0 233.4 1127.2 278.7 1108.9C283.5 1106.9 284.3 1108.4 282.1 1115.5C277.5 1130.9 266.8 1149.0 253.5 1164.0C249.0 1169.1 246.4 1172.8 246.9 1173.3C247.5 1173.9 253.6 1174.0 261.2 1173.7C296.5 1172.3 321.6 1155.3 348.5 1114.8C355.3 1104.4 357.0 1104.4 357.0 1114.4C356.9 1132.0 352.8 1148.0 342.3 1171.8C341.2 1174.4 351.1 1173.0 365.5 1168.4C400.1 1157.4 430.0 1131.5 450.7 1094.8C456.6 1084.3 458.2 1083.4 459.2 1090.0C461.8 1107.8 457.7 1133.4 449.0 1152.7C445.1 1161.2 445.8 1161.5 459.2 1157.6C485.0 1150.1 506.6 1139.8 520.6 1128.4C523.7 1125.9 526.6 1124.0 527.2 1124.2C530.1 1125.2 526.2 1219.8 521.4 1262.5C516.4 1308.5 508.6 1339.4 500.0 1348.0C498.0 1350.0 495.4 1350.0 273.6 1350.0C141.3 1350.0 48.9 1349.6 48.6 1349.1ZM853.5 405.6C878.2 400.2 899.7 380.9 905.2 359.0C909.6 341.7 909.7 335.4 906.1 321.5C895.4 280.1 849.4 257.6 811.2 275.2C793.7 283.3 781.8 296.1 774.4 315.0C770.6 324.4 770.6 324.6 770.6 339.5C770.5 352.8 770.8 355.2 772.9 360.9C784.9 393.7 819.7 413.0 853.5 405.6Z", "sun": "M820.0 404.6C797.4 397.8 780.7 382.3 772.9 360.9C770.8 355.2 770.5 352.8 770.6 339.5C770.6 324.6 770.6 324.4 774.4 315.0C781.8 296.1 793.7 283.3 811.2 275.2C849.4 257.6 895.4 280.1 906.1 321.5C909.7 335.4 909.6 341.7 905.2 359.0C902.2 370.9 892.5 384.7 881.1 393.3C864.7 405.6 839.0 410.4 820.0 404.6Z", "girika": "M1567.2 897.9C1440.1 888.2 1338.8 800.9 1313.6 679.5C1297.7 602.8 1308.7 519.5 1342.7 459.6C1383.2 387.9 1447.0 341.0 1529.2 322.5C1597.9 307.0 1688.6 315.3 1759.0 343.7C1773.2 349.4 1782.9 354.2 1783.5 355.8C1783.8 356.6 1784.5 374.2 1785.0 394.9C1785.5 415.6 1786.2 443.6 1786.6 457.2C1787.4 485.7 1787.6 485.0 1779.5 485.0C1773.0 485.0 1772.4 484.3 1767.5 471.5C1750.0 425.5 1721.4 388.7 1684.4 364.7C1648.7 341.5 1606.1 334.0 1561.8 343.0C1479.4 359.8 1424.3 438.4 1411.8 557.0C1408.5 588.6 1410.4 642.6 1416.1 676.5C1432.0 771.3 1478.3 837.8 1546.4 863.1C1579.6 875.5 1632.7 875.0 1665.6 862.0C1681.9 855.6 1700.9 843.7 1707.5 835.9L1710.0 832.8L1710.0 771.0C1710.0 735.4 1709.6 704.9 1709.0 699.1C1706.2 671.8 1693.1 654.2 1671.2 648.4C1667.5 647.5 1664.1 646.3 1663.6 645.9C1662.4 644.8 1662.0 633.7 1663.2 632.2C1664.8 630.3 1836.3 630.4 1837.9 632.4C1839.7 634.5 1838.9 646.1 1837.0 647.0C1836.2 647.4 1832.6 649.1 1829.1 650.6C1818.1 655.5 1809.9 665.1 1805.6 678.2C1801.8 689.4 1801.7 692.4 1801.3 767.0C1801.1 807.4 1800.8 841.5 1800.5 842.6C1799.9 845.3 1767.3 861.9 1747.0 869.9C1688.6 893.0 1627.4 902.6 1567.2 897.9ZM3141.6 897.9C3098.4 892.3 3066.2 866.1 3055.9 828.0C3052.6 815.8 3052.6 792.5 3055.8 779.6C3067.6 732.9 3109.8 703.3 3203.4 675.9C3212.8 673.1 3229.1 668.4 3239.5 665.3C3249.9 662.2 3261.9 658.8 3266.1 657.6C3277.4 654.5 3277.0 655.1 3277.0 639.1C3276.9 614.6 3275.2 587.9 3273.2 577.5C3266.7 544.9 3252.5 526.6 3227.0 518.0C3218.9 515.2 3198.7 514.2 3188.5 515.9C3150.3 522.6 3114.8 555.4 3094.5 603.0C3090.3 612.8 3090.1 613.0 3083.4 613.0C3075.3 613.0 3075.6 615.0 3077.5 573.3C3079.4 530.4 3078.2 534.5 3092.6 524.8C3131.0 498.8 3174.4 486.0 3223.8 486.0C3293.5 486.0 3338.0 512.1 3355.0 562.8C3363.4 588.1 3364.0 597.4 3364.0 715.5C3364.0 814.4 3364.2 821.4 3367.5 832.5C3373.1 851.9 3392.4 859.2 3407.1 847.5C3412.2 843.5 3413.8 843.2 3417.4 846.1C3423.6 851.0 3422.0 856.6 3411.0 868.4C3379.5 902.0 3323.0 907.9 3296.9 880.3C3287.6 870.4 3280.0 853.5 3280.0 842.7C3280.0 840.7 3279.6 838.8 3279.0 838.5C3278.1 838.0 3269.5 846.4 3266.4 850.9C3262.5 856.4 3240.8 873.8 3228.5 881.2C3205.8 894.8 3170.6 901.6 3141.6 897.9ZM1887.7 887.3C1886.8 886.4 1886.8 875.8 1887.8 874.4C1888.2 873.8 1892.2 871.6 1896.8 869.5C1909.9 863.4 1916.7 854.2 1920.7 837.0C1923.1 826.8 1923.5 578.4 1921.1 569.0C1917.4 554.5 1909.1 544.5 1894.4 537.0L1885.5 532.5L1885.2 527.9C1885.0 524.8 1885.4 522.9 1886.4 522.1C1887.7 521.0 1909.4 513.9 1945.2 502.9C1952.3 500.8 1964.0 497.2 1971.2 494.9C1978.5 492.7 1988.1 489.8 1992.4 488.4C2001.2 485.7 2007.2 485.3 2008.8 487.3C2009.6 488.2 2010.0 538.3 2010.3 657.1C2010.6 805.8 2010.8 826.4 2012.2 833.2C2016.5 853.9 2023.9 864.2 2039.3 871.0C2047.8 874.7 2048.4 875.5 2047.8 883.1L2047.5 887.5L1967.9 887.8C1924.2 887.9 1888.0 887.7 1887.7 887.3ZM2096.7 887.3C2095.8 886.4 2095.8 876.8 2096.8 875.4C2097.2 874.8 2101.6 872.2 2106.6 869.7C2119.8 863.1 2125.8 855.7 2130.2 840.5L2132.5 832.5L2132.5 703.0L2132.5 573.5L2130.2 565.5C2126.1 551.3 2119.4 543.9 2103.6 536.0L2096.5 532.5L2096.2 527.9C2095.8 521.7 2097.0 520.7 2109.3 516.9C2114.9 515.2 2121.5 513.2 2124.0 512.3C2126.5 511.5 2134.1 509.1 2141.0 507.0C2156.6 502.2 2194.4 490.6 2202.7 488.0C2209.8 485.7 2215.0 485.4 2216.8 487.2C2217.7 488.1 2218.0 500.0 2218.0 534.6C2218.0 580.0 2218.4 586.1 2221.1 579.3C2234.9 543.8 2262.7 511.0 2291.0 496.6C2314.3 484.8 2342.4 482.7 2367.6 490.9C2376.4 493.7 2381.8 496.6 2382.5 499.0C2383.3 501.5 2383.4 500.9 2374.8 536.0C2371.0 551.7 2367.0 568.3 2365.9 572.9C2362.8 586.0 2361.7 586.5 2353.2 578.7C2338.3 565.0 2324.8 558.2 2308.1 555.9C2268.4 550.3 2236.6 578.5 2224.1 630.5L2221.5 641.5L2221.5 734.0C2221.5 826.2 2221.5 826.5 2223.7 834.8C2228.5 852.8 2236.0 861.9 2251.0 867.8C2255.5 869.6 2268.4 872.9 2271.2 873.0C2274.5 873.1 2276.6 884.0 2273.8 886.8C2272.5 888.1 2098.0 888.6 2096.7 887.3ZM2420.2 886.8C2418.6 885.2 2418.7 876.8 2420.2 874.8C2420.9 873.9 2424.3 872.0 2427.7 870.7C2443.1 864.5 2450.9 854.1 2454.8 834.7C2457.4 821.9 2457.3 582.5 2454.7 570.5C2451.2 554.3 2443.4 544.2 2429.2 537.4C2425.0 535.3 2421.2 533.2 2420.8 532.6C2419.8 531.2 2419.8 523.8 2420.8 522.3C2421.2 521.6 2433.2 517.5 2447.5 513.1C2461.8 508.8 2487.3 500.9 2504.1 495.6C2521.0 490.3 2536.1 486.0 2537.8 486.0C2544.5 486.0 2544.0 471.9 2544.0 654.6C2544.0 796.5 2544.2 821.4 2545.5 830.0C2548.9 852.3 2557.1 864.2 2574.0 871.0L2582.1 874.3L2581.8 880.9L2581.5 887.5L2501.5 887.8C2440.0 888.0 2421.1 887.7 2420.2 886.8ZM2631.2 886.8C2629.9 885.5 2629.6 877.2 2630.8 875.4C2631.2 874.8 2634.8 872.6 2638.8 870.6C2653.9 863.0 2660.5 853.2 2664.6 832.0C2666.5 822.2 2666.8 392.5 2664.9 378.1C2662.2 357.7 2653.2 343.6 2638.1 336.6C2635.0 335.1 2631.8 333.6 2631.0 333.1C2628.9 332.0 2628.4 323.7 2630.4 321.7C2631.9 320.3 2651.5 313.7 2707.5 296.0C2748.0 283.1 2747.5 283.2 2750.8 285.7L2753.5 287.7L2754.1 558.1C2754.5 754.6 2754.9 830.0 2755.8 833.9C2760.1 854.0 2768.1 865.2 2782.0 870.5C2792.3 874.4 2792.1 874.3 2791.8 881.4L2791.5 887.5L2712.0 887.8C2650.9 888.0 2632.1 887.7 2631.2 886.8ZM2930.0 885.6C2906.3 880.1 2899.5 872.7 2843.5 792.0C2816.2 752.7 2810.3 744.2 2792.5 719.0C2784.3 707.4 2770.0 686.0 2767.5 681.7C2765.2 677.6 2765.0 676.7 2766.1 675.3C2768.1 672.9 2789.4 652.2 2829.5 613.8C2878.9 566.5 2885.1 559.8 2891.0 548.2C2897.3 535.6 2895.4 522.8 2886.2 516.8C2882.4 514.2 2870.9 510.0 2867.9 510.0C2863.0 510.0 2860.5 497.4 2864.9 495.0C2868.2 493.3 3012.3 494.1 3014.4 495.9C3015.7 497.0 3016.0 498.6 3015.8 502.4C3015.5 508.3 3015.0 508.6 3002.5 512.4C2986.1 517.3 2970.0 525.6 2951.0 538.8C2932.8 551.4 2925.1 558.1 2882.4 597.9C2850.4 627.9 2842.0 636.2 2842.0 638.2C2842.0 639.1 2845.2 644.5 2849.2 650.2C2853.1 655.9 2859.8 665.5 2863.9 671.5C2875.5 688.5 2888.1 706.6 2892.0 712.0C2893.9 714.7 2898.7 721.5 2902.5 727.0C2906.3 732.6 2914.9 744.7 2921.5 754.0C2928.1 763.3 2937.3 776.4 2942.0 783.1C2983.6 842.5 2999.6 859.4 3024.1 869.6C3029.1 871.6 3033.5 874.1 3034.1 875.1C3035.4 877.6 3035.2 885.4 3033.8 886.8C3032.9 887.7 3021.0 888.0 2986.0 887.9C2941.6 887.9 2939.1 887.8 2930.0 885.6ZM3222.5 849.3C3239.3 844.6 3258.7 831.4 3272.4 815.2L3276.9 810.0L3277.0 745.1C3277.0 691.0 3276.8 680.1 3275.7 679.1C3274.6 678.2 3269.6 679.5 3253.4 684.9C3173.1 711.5 3142.1 740.4 3142.0 788.7C3142.0 820.9 3157.2 842.5 3185.4 850.1C3194.5 852.6 3212.1 852.2 3222.5 849.3ZM1947.7 427.6C1909.5 416.3 1897.2 367.6 1925.4 339.5C1953.4 311.5 2003.6 322.7 2015.8 359.6C2029.7 401.4 1990.8 440.3 1947.7 427.6ZM2487.2 428.9C2441.5 419.9 2428.1 361.2 2465.6 334.4C2487.6 318.7 2518.6 320.9 2537.4 339.4C2567.1 368.8 2552.9 417.8 2511.5 428.5C2505.2 430.1 2494.2 430.3 2487.2 428.9Z", "homes": "M2902.4 1196.9C2873.7 1194.2 2852.0 1178.8 2844.0 1155.5C2841.5 1148.1 2841.4 1143.3 2843.8 1142.6C2848.8 1141.2 2872.1 1137.8 2873.4 1138.3C2874.3 1138.7 2876.1 1141.5 2877.5 1144.6C2882.8 1156.5 2890.4 1162.6 2903.9 1165.6C2927.7 1170.9 2948.6 1160.5 2946.7 1144.3C2945.7 1135.5 2937.5 1130.4 2915.5 1125.0C2860.7 1111.7 2848.0 1101.8 2848.0 1072.3C2848.0 1042.2 2870.0 1023.7 2907.5 1022.3C2940.5 1021.0 2963.6 1032.8 2974.5 1056.5C2978.6 1065.3 2979.6 1069.5 2977.8 1070.6C2975.8 1071.9 2948.9 1078.0 2947.9 1077.4C2947.4 1077.2 2946.2 1074.9 2945.1 1072.5C2939.0 1058.7 2927.5 1052.0 2910.0 1052.0C2892.2 1052.0 2880.6 1060.9 2882.3 1073.3C2883.5 1081.8 2889.8 1085.4 2913.0 1091.0C2960.9 1102.4 2975.8 1111.5 2980.6 1131.9C2990.1 1172.2 2954.4 1201.9 2902.4 1196.9ZM2081.6 1195.4C2060.6 1190.7 2042.2 1177.5 2031.3 1159.5C2017.5 1136.6 2014.8 1100.5 2025.0 1074.2C2034.0 1050.9 2052.3 1033.2 2074.9 1025.9C2097.2 1018.6 2126.4 1021.6 2145.5 1033.1C2176.1 1051.4 2190.8 1091.3 2182.3 1132.9C2175.8 1165.2 2156.8 1186.0 2125.5 1195.0C2118.8 1197.0 2089.7 1197.2 2081.6 1195.4ZM1756.5 1192.8C1756.2 1192.1 1756.1 1154.4 1756.2 1109.0L1756.5 1026.5L1773.0 1026.5L1789.5 1026.5L1790.0 1059.5L1790.5 1092.5L1827.5 1092.5L1864.5 1092.5L1864.8 1060.1C1864.9 1038.2 1865.4 1027.2 1866.1 1026.3C1867.6 1024.5 1896.0 1024.4 1897.8 1026.2C1899.7 1028.1 1899.5 1191.3 1897.6 1192.9C1896.7 1193.7 1891.3 1194.0 1880.9 1193.8L1865.5 1193.5L1865.0 1159.0L1864.5 1124.5L1827.5 1124.5L1790.5 1124.5L1790.2 1157.9C1790.1 1180.5 1789.6 1191.8 1788.9 1192.7C1787.3 1194.5 1757.2 1194.6 1756.5 1192.8ZM2307.3 1192.8C2305.7 1190.2 2306.3 1027.0 2308.0 1026.0C2310.3 1024.5 2335.3 1024.7 2337.3 1026.2C2338.2 1026.9 2350.5 1050.9 2364.6 1079.5C2389.2 1129.4 2392.2 1135.0 2394.2 1135.0C2394.7 1135.0 2407.0 1110.8 2421.6 1081.2C2436.1 1051.7 2448.8 1026.9 2449.7 1026.2C2452.2 1024.4 2478.3 1024.5 2479.9 1026.4C2480.7 1027.4 2480.9 1050.2 2480.8 1110.6L2480.5 1193.5L2466.1 1193.8C2456.4 1194.0 2451.3 1193.7 2450.4 1192.9C2449.2 1192.0 2449.0 1183.7 2449.0 1145.3C2449.0 1110.1 2448.7 1098.9 2447.8 1099.2C2446.3 1099.7 2447.1 1098.2 2434.1 1125.5C2411.3 1173.7 2404.3 1188.6 2403.6 1190.7C2402.7 1193.5 2400.2 1194.2 2392.5 1193.8L2386.5 1193.5L2379.0 1178.5C2374.9 1170.2 2365.4 1150.9 2358.0 1135.5C2340.3 1098.8 2340.7 1099.7 2339.1 1099.2C2337.9 1098.8 2337.8 1105.9 2338.1 1146.1L2338.5 1193.5L2323.3 1193.8C2311.9 1194.0 2307.9 1193.7 2307.3 1192.8ZM2611.5 1192.9C2610.2 1190.8 2611.0 1026.6 2612.3 1025.8C2614.4 1024.4 2722.4 1024.8 2723.8 1026.2C2725.5 1027.9 2725.5 1053.1 2723.8 1054.8C2722.9 1055.7 2712.8 1056.0 2684.4 1056.0C2653.1 1056.0 2646.0 1056.2 2645.1 1057.4C2644.3 1058.3 2644.0 1063.8 2644.2 1074.6L2644.5 1090.5L2675.9 1090.8C2697.1 1090.9 2707.8 1091.4 2708.7 1092.1C2710.5 1093.6 2710.6 1119.0 2708.8 1120.8C2707.9 1121.7 2699.5 1122.0 2677.0 1122.0C2654.5 1122.0 2646.1 1122.3 2645.2 1123.2C2644.4 1124.0 2644.0 1129.9 2644.0 1143.0C2644.0 1156.1 2644.4 1162.0 2645.2 1162.8C2646.1 1163.7 2656.2 1164.0 2684.6 1164.0C2717.2 1164.0 2722.9 1164.2 2724.0 1165.5C2724.9 1166.6 2725.0 1170.1 2724.4 1180.2L2723.5 1193.5L2667.8 1193.8C2629.0 1193.9 2611.9 1193.7 2611.5 1192.9ZM2115.1 1165.4C2136.6 1160.5 2149.3 1139.8 2149.2 1109.5C2149.1 1076.7 2134.6 1056.4 2108.9 1053.0C2076.5 1048.6 2054.9 1071.4 2054.8 1110.0C2054.7 1150.6 2079.5 1173.5 2115.1 1165.4Z"};
  const STORE = "reelstudio-brands-v1", ACTIVE = "reelstudio-active-brand";
  const BUILTIN = { id:"girika", builtin:true, name:"Girika Homes", industry:"realestate", tagline:"Plots, homes and property in Dehradun and nearby areas",
    city:"Dehradun", location:"Dehradun, Uttarakhand", area:"Sahastradhara Road", phone:"90585 37664", phone2:"", web:"girikahomes.com", handle:"@girikahomes",
    colors:{ dark:"#2C3A47", brand:"#556348", accent:"#9A5B40", light:"#F4F1EC" }, fonts:{ head:"Fraunces", body:"Manrope" }, logo:{ type:"vector" } };
  const FONTS_HEAD = ["Fraunces","Playfair Display","DM Serif Display","Lora","Cormorant Garamond","Montserrat","Poppins","Oswald","Bebas Neue","Inter"];
  const FONTS_BODY = ["Manrope","Inter","DM Sans","Poppins","Montserrat","Lato","Open Sans","Nunito","Work Sans"];
  const INDUSTRIES = [["realestate","Real estate"],["restaurant","Restaurant or cafe"],["beauty","Salon, spa or clinic"],["retail","Shop or retail"],["general","Any business or service"]];

  /* ---------- colour maths ---------- */
  const hex2rgb = h => { h = String(h || "#000").replace("#", ""); if (h.length === 3) h = h.split("").map(x => x + x).join(""); const n = parseInt(h, 16) || 0; return [n >> 16, (n >> 8) & 255, n & 255]; };
  const rgb2hex = (r, g, b) => "#" + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
  const mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  const lum = h => { const [r, g, b] = hex2rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  function derive(col){
    const dark = col.dark || "#2C3A47", brand = col.brand || "#556348", accent = col.accent || "#9A5B40", light = col.light || "#F4F1EC";
    return { slate:dark, deodar:brand, clay:accent, clayLt:mix(accent, "#FFFFFF", .3), lime:light, mist:mix(light, brand, .14), sage:mix(brand, "#FFFFFF", .45), ink:mix(dark, "#000000", .35), fog:mix(dark, "#8A8F96", .55) };
  }

  /* ---------- kits ---------- */
  const HAS_RS = !!(window.RS && RS.collection && RS.fs);
  const EMBED = window.parent !== window;
  const FULL_MSG = "Could not save: browser storage is full. Use smaller logo files, delete an old brand, or choose a save folder.";
  const fileIds = new Set();
  const folderReady = () => HAS_RS && RS.fs.state === "ready";
  const inFolder = id => folderReady() && fileIds.has(RS.slug(id));
  const markFile = (id, on) => { if (!HAS_RS) return; const k = RS.slug(id); if (on) fileIds.add(k); else fileIds.delete(k); };
  async function refreshFileIds(){
    if (!folderReady()) return;
    try { const fl = await RS.fs.list("brands"); fileIds.clear(); fl.forEach(f => { if (f.kind === "file" && f.name.endsWith(".json")) fileIds.add(f.name.slice(0, -5)); }); } catch(e) {}
  }
  /* light copy for the cache: drops logo image data (the full copy stays in the folder) */
  const slimKit = k => k && k.logo && k.logo.type === "image" ? { ...k, logo:{ type:"image" } } : { ...k };
  /* only slim a kit when its full copy is safely in the folder, and never the active one */
  const keepFull = k => !k || k.id === activeId() || !inFolder(k.id);
  const COL = HAS_RS ? RS.collection("brands", STORE, { prefix:"b", slim:slimKit, keepFull }) : null;
  function readSaved(){ let s = []; try { s = JSON.parse(localStorage.getItem(STORE) || "[]"); } catch(e) {} return Array.isArray(s) ? s.filter(k => k && k.id) : []; }
  function readKits(){
    const saved = readSaved();
    const over = saved.find(k => k.id === "girika"), list = saved.filter(k => k.id !== "girika" && !k.deleted);
    const girika = over ? { ...BUILTIN, ...over, builtin:true } : { ...BUILTIN };
    return over && over.deleted ? list : [girika, ...list];
  }
  function writeKits(list){
    try { localStorage.setItem(STORE, JSON.stringify(list)); return true; } catch(e) {}
    if (!folderReady()) return false;
    try { localStorage.setItem(STORE, JSON.stringify(list.map(k => k._slim || keepFull(k) ? k : { ...slimKit(k), _slim:true }))); return true; } catch(e) { return false; }
  }
  function prep(kit){ if (!kit.id) kit.id = HAS_RS ? RS.uid("b") : "b" + Date.now().toString(36); kit.updated = Date.now(); delete kit._slim; return kit; }
  /* sync save (cache now, folder in the background). Returns the kit, or null when it could not be stored. */
  function saveKit(kit){
    if (!kit) return null; prep(kit);
    const saved = readSaved().filter(k => k.id !== kit.id); saved.push(kit);
    if (!writeKits(saved)) return null;
    if (COL) COL.save(kit).then(() => markFile(kit.id, folderReady())).catch(e => console.warn("Brand save to folder failed", e));
    return kit;
  }
  /* async save that waits for the folder. Resolves { kit, folder, folderError }, throws when nothing could be stored. */
  async function saveKitAsync(kit){
    if (!kit) throw new Error("Nothing to save.");
    if (!COL){ if (!saveKit(kit)) throw new Error(FULL_MSG); return { kit, folder:false, folderError:false }; }
    prep(kit); const t0 = Date.now(), want = folderReady();
    let saved;
    try { saved = await COL.save(kit); } catch(e) { throw new Error(FULL_MSG); }
    kit.id = saved.id; kit.updated = saved.updated;
    let folder = false;
    if (want){ try { folder = (await RS.fs.readFile(COL.file(saved.id))).lastModified >= t0 - 2000; } catch(e) {} markFile(saved.id, folder); }
    return { kit:saved, folder, folderError:want && !folder };
  }
  const deletedGirika = () => ({ id:"girika", name:BUILTIN.name, deleted:true, updated:Date.now() });
  function afterDelete(id){ if (activeId() === id){ const k = readKits()[0]; setActive(k ? k.id : ""); } }
  function deleteKit(id){
    const saved = readSaved().filter(k => k.id !== id), marker = id === "girika" ? deletedGirika() : null;
    if (marker) saved.push(marker);
    writeKits(saved);
    if (COL) (marker ? COL.save(marker) : COL.remove(id)).then(() => markFile(id, !!marker && folderReady())).catch(e => console.warn("Brand delete in folder failed", e));
    afterDelete(id);
  }
  /* resolves { folderError } */
  async function deleteKitAsync(id){
    if (!COL){ deleteKit(id); return { folderError:false }; }
    const want = folderReady(); let folderError = false;
    if (id === "girika"){ await COL.save(deletedGirika()); markFile(id, want); }
    else { await COL.remove(id); if (want) folderError = await RS.fs.exists(COL.file(id)).catch(() => false); markFile(id, folderError); }
    afterDelete(id);
    return { folderError };
  }
  function activeId(){ try { return localStorage.getItem(ACTIVE) || ""; } catch(e) { return ""; } }
  function setActive(id){ try { localStorage.setItem(ACTIVE, id); } catch(e) {} }
  const isSlim = id => !!(readSaved().find(k => k.id === id) || {})._slim;
  /* make a kit active, loading its full copy (logos) from the folder first when the cache only has a light copy.
     Resolves true when ready to reload, false when the full copy is not reachable (folder not connected). */
  async function switchTo(id){
    if (!isSlim(id) || !COL){ setActive(id); return true; }
    let f = null; try { f = await COL.full(id); } catch(e) {}
    if (!f || f._slim) return false;
    const prev = activeId(); setActive(id);
    if (!writeKits(readSaved().map(k => k.id === id ? f : k))){ setActive(prev); return false; }
    return true;
  }
  /* full copy of a kit (with logos), or null when only a light copy is reachable */
  async function fullKit(id){
    const c = readKits().find(k => k.id === id) || null;
    if (!c || !c._slim || !COL) return c;
    let f = null; try { f = await COL.full(id); } catch(e) {}
    return f && !f._slim ? f : null;
  }
  /* "folder", "browser" or "builtin" */
  function whereSaved(id){
    const c = readSaved().find(k => k.id === id);
    if (id === "girika" && !c) return "builtin";
    return inFolder(id) ? "folder" : "browser";
  }
  const kits = readKits();
  const kitSig = () => { const ks = readKits(), k = ks.find(x => x.id === activeId()) || ks[0]; return k ? JSON.stringify(k) : ""; };
  const SIG0 = kitSig();
  let KIT = kits.find(k => k.id === activeId()) || kits[0] || { ...BUILTIN };
  KIT = { ...BUILTIN, ...KIT, colors:{ ...BUILTIN.colors, ...(KIT.colors || {}) }, fonts:{ ...BUILTIN.fonts, ...(KIT.fonts || {}) }, logo:KIT.logo || { type:"vector" } };
  if (KIT.id !== "girika" && KIT.logo.type === "vector") KIT.logo = { type:"text" };

  /* ---------- palette (same keys the editors already use) ---------- */
  const D = derive(KIT.colors);
  const PALETTE = [
    { key:"slate",  css:"--slate",   name:"Dark",          hex:D.slate,  role:"Primary", use:"Headings, dark sections" },
    { key:"deodar", css:"--deodar",  name:"Brand",         hex:D.deodar, role:"Brand",   use:"Badges, highlights" },
    { key:"sage",   css:"--sage",    name:"Brand light",   hex:D.sage,   role:"Support", use:"On dark only" },
    { key:"clay",   css:"--clay",    name:"Accent",        hex:D.clay,   role:"Action",  use:"Buttons" },
    { key:"clayLt", css:"--clay-lt", name:"Accent light",  hex:D.clayLt, role:"Accent",  use:"Highlights on dark" },
    { key:"lime",   css:"--lime",    name:"Light",         hex:D.lime,   role:"Base",    use:"Light background" },
    { key:"mist",   css:"--mist",    name:"Soft",          hex:D.mist,   role:"Surface", use:"Cards" },
    { key:"ink",    css:"--ink",     name:"Text",          hex:D.ink,    role:"Text",    use:"Body text" },
    { key:"fog",    css:"--fog",     name:"Muted",         hex:D.fog,    role:"Text",    use:"Captions" }
  ];
  const C = { white:"#FFFFFF", line:"#DAD5CC" };
  PALETTE.forEach(p => { C[p.key] = p.hex; });
  const TONES = {
    light:        { arch:C.deodar, sun:C.clay,   girika:C.slate, homes:C.deodar },
    dark:         { arch:C.lime,   sun:C.clayLt, girika:C.lime,  homes:C.sage },
    green:        { arch:C.lime,   sun:C.clayLt, girika:C.lime,  homes:C.mist },
    "mono-slate": { arch:C.slate,  sun:C.slate,  girika:C.slate, homes:C.slate },
    "mono-white": { arch:C.white,  sun:C.white,  girika:C.white, homes:C.white }
  };

  /* ---------- fonts ---------- */
  const head = KIT.fonts.head || "Fraunces", body = KIT.fonts.body || "Manrope";
  const FONTS = { head, body, SERIF:`"${head}", "Noto Serif Devanagari", Georgia, serif`, SANS:`"${body}", "Noto Sans Devanagari", Arial, sans-serif` };
  function fontURL(list){ return "https://fonts.googleapis.com/css2?" + [...new Set(list)].map(f => "family=" + f.replace(/ /g, "+") + ":ital,wght@0,400;0,500;0,600;0,700;0,800;1,500").join("&") + "&display=swap"; }
  /* RS.fonts.load tries weight sets until Google Fonts accepts one, so any family works */
  const FONTS_P = (window.RS && RS.fonts ? Promise.resolve(RS.fonts.restored).catch(() => {}).then(() => Promise.all([RS.fonts.load(head), RS.fonts.load(body)]))
    : (() => { if (head !== "Fraunces" || body !== "Manrope"){ const l = document.createElement("link"); l.rel = "stylesheet"; l.href = fontURL([head, body]).replace(/:ital,wght@[^&]*/g, ""); document.head.appendChild(l); }
        return document.fonts ? Promise.all([`600 40px "${head}"`, `700 20px "${body}"`].map(f => document.fonts.load(f))) : Promise.resolve(); })()).catch(() => {});

  /* ---------- uploaded logos ---------- */
  const IMG = KIT.logo.type === "image" && KIT.logo.light ? {} : null;
  /* onReady fires once fonts and logos are ready, or after 4s at most. If something finishes after that,
     the callbacks run again so canvases redraw with the real font or logo. */
  const readyCbs = [], lateCbs = []; let isReady = false, logosReady = !IMG, fontsReady = false, readyTimer = 0;
  const call = f => { try { f(); } catch(e) { console.error(e); } };
  function settle(timeout){
    const all = logosReady && fontsReady;
    if (!isReady){ if (!all && !timeout) return; isReady = true; clearTimeout(readyTimer); const fs = readyCbs.splice(0); if (!all) lateCbs.push(...fs); fs.forEach(call); }
    else if (all && lateCbs.length) lateCbs.splice(0).forEach(call);
  }
  readyTimer = setTimeout(() => settle(true), 4000);
  FONTS_P.then(() => { fontsReady = true; settle(); });
  function onReady(f){ if (typeof f !== "function") return; if (!isReady) readyCbs.push(f); else { call(f); if (!(logosReady && fontsReady)) lateCbs.push(f); } }
  function tint(img, color){ const c = document.createElement("canvas"); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height; const x = c.getContext("2d"); x.drawImage(img, 0, 0); x.globalCompositeOperation = "source-in"; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height); return c; }
  if (IMG){
    const load = src => new Promise(res => { if (!src) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
    Promise.all([load(KIT.logo.light), load(KIT.logo.dark), load(KIT.logo.icon)]).then(([l, d, ic]) => {
      IMG.light = l; IMG.darkUser = !!d; IMG.dark = d || (l ? tint(l, "#FFFFFF") : null); IMG.mono = l ? tint(l, C.slate) : null;
      IMG.icon = ic; IMG.iconDark = ic ? tint(ic, "#FFFFFF") : null; IMG.iconMono = ic ? tint(ic, C.slate) : null;
      logosReady = true; settle();
    });
  }
  function pickImg(kind, tone){
    if (!IMG) return null;
    const useIcon = kind === "mark" && IMG.icon, onDark = tone === "dark" || tone === "green" || tone === "mono-white";
    if (useIcon) return onDark ? IMG.iconDark : tone === "mono-slate" ? IMG.iconMono : IMG.icon;
    return onDark ? IMG.dark : tone === "mono-slate" ? IMG.mono : IMG.light;
  }
  function imgAspect(kind){ const im = pickImg(kind, "light") || IMG && IMG.light; const w = im && (im.naturalWidth || im.width), h = im && (im.naturalHeight || im.height); return w && h ? h / w : .35; }
  function drawImageLogo(c, kind, tone, x, y, width){
    const h = width * imgAspect(kind), onDark = tone === "dark" || tone === "green";
    /* no white logo uploaded: show the real logo on a small light badge instead of a flat white shape */
    if (onDark && IMG && !IMG.darkUser && !(kind === "mark" && IMG.icon)){
      const im = IMG.light; if (!im) return h; const p = Math.min(width, h) * .11;
      c.save(); c.fillStyle = C.lime; c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = p; c.beginPath(); c.roundRect(x - p, y - p, width + p * 2, h + p * 2, p * 1.4); c.fill(); c.restore();
      c.drawImage(im, x, y, width, h); return h;
    }
    const im = pickImg(kind, tone); if (im) c.drawImage(im, x, y, width, h); return h;
  }
  /* no logo uploaded: the brand name as a clean wordmark */
  const TEXTLOGO = KIT.logo.type === "text" || (KIT.logo.type === "image" && !KIT.logo.light);
  function drawTextLogo(c, kind, tone, x, y, width){
    const onDark = tone === "dark" || tone === "green" || tone === "mono-white", col = tone === "mono-white" ? "#FFFFFF" : onDark ? C.lime : C.slate;
    const name = kind === "mark" ? (KIT.name || "R").trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase() : (KIT.name || "Your brand");
    const h = width * textAspect(kind); c.save(); c.textBaseline = "middle"; c.textAlign = "left";
    if (kind === "mark"){ c.fillStyle = onDark ? C.clayLt : C.deodar; c.beginPath(); c.roundRect(x, y, width, h, width * .22); c.fill(); c.fillStyle = onDark ? C.slate : "#FFFFFF"; c.font = `700 ${h * .46}px ${FONTS.SERIF}`; c.textAlign = "center"; c.fillText(name, x + width / 2, y + h / 2 + h * .03); }
    else { let fs = h * .8; c.font = `600 ${fs}px ${FONTS.SERIF}`; const tw = c.measureText(name).width; if (tw > width){ fs *= width / tw; c.font = `600 ${fs}px ${FONTS.SERIF}`; } c.fillStyle = col; c.fillText(name, x, y + h / 2); }
    c.restore(); return h;
  }
  function textAspect(kind){ if (kind === "mark") return 1; const n = (KIT.name || "Your brand").length; return Math.max(.12, Math.min(.5, 1.6 / Math.max(4, n))); }

  /* ---------- text auto-fill: built-in Girika words and {tokens} become this brand's details ---------- */
  const v = (x, ph) => (x && String(x).trim()) ? String(x).trim() : ph;
  const NAME = v(KIT.name, "[Your brand]"), CITY = v(KIT.city, "[City]"), WEB = v(KIT.web, "[website]"), HANDLE = v(KIT.handle, "@[handle]"), PHONE = v(KIT.phone, "[phone]");
  const MAP = [
    ["Girika Homes", NAME], ["GIRIKA HOMES", NAME.toUpperCase()], ["girikahomes.com", WEB], ["@girikahomes", HANDLE], ["girikahomes", HANDLE.replace(/^@/, "")],
    ["Viraj, Shubham and Amit. We help you buy land in Dehradun the honest way.", "[Names]. " + v(KIT.tagline, "[What you do, in one line]")], ["Plots, homes and property in Dehradun and nearby areas", v(KIT.tagline, "[What you do, in one line]")], ["90585 37664", PHONE], ["Dehradun, Uttarakhand", v(KIT.location, CITY)], ["Sahastradhara Road", v(KIT.area, "[Area]")], ["Dehradun", CITY],
    ["{name}", NAME], ["{NAME}", NAME.toUpperCase()], ["{city}", CITY], ["{location}", v(KIT.location, CITY)], ["{area}", v(KIT.area, "[Area]")], ["{web}", WEB], ["{handle}", HANDLE],
    ["{handlebare}", HANDLE.replace(/^@/, "")], ["{phone}", PHONE], ["{tagline}", v(KIT.tagline, "[What you do, in one line]")]
  ];
  const fillStr = s => { if (typeof s !== "string" || (KIT.id === "girika" && !s.includes("{"))) return s; let o = s; for (const [a, b] of MAP) if (o.includes(a)) o = o.split(a).join(b); return o; };
  function fill(obj){
    if (typeof obj === "string") return fillStr(obj);
    if (!obj || typeof obj !== "object") return obj;
    if (Array.isArray(obj)){ for (let i = 0; i < obj.length; i++) obj[i] = typeof obj[i] === "string" ? fillStr(obj[i]) : fill(obj[i]); return obj; }
    for (const k of Object.keys(obj)){ const x = obj[k]; if (typeof x === "string") obj[k] = fillStr(x); else if (x && typeof x === "object" && !(x instanceof Node)) fill(x); }
    return obj;
  }
  /* ---------- folder sync on load ---------- */
  const syncCbs = new Set(); let stale = false, touched = false;
  const t0 = Date.now(), RELOAD_KEY = "reelstudio-brand-autoreload";
  function emitSynced(info){ if (info.activeChanged) stale = true; syncCbs.forEach(f => { try { f(info); } catch(e) { console.error(e); } }); }
  /* folder to cache (folder wins when newer). Resolves { changed, activeChanged } and never throws. */
  async function syncKits(){
    let changed = false;
    if (COL){ try { await RS.fs.ready; await refreshFileIds(); changed = await COL.sync(); } catch(e) { console.warn("Brand sync failed", e); } await refreshFileIds(); }
    const info = { changed, activeChanged:kitSig() !== SIG0 };
    emitSynced(info); return info;
  }
  function onKitsSynced(f){ if (typeof f !== "function") return () => {}; syncCbs.add(f); if (stale) call(() => f({ changed:true, activeChanged:true })); return () => syncCbs.delete(f); }
  if (COL){
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach(t => window.addEventListener(t, () => { touched = true; }, { capture:true, once:true, passive:true }));
    const recentReload = () => { try { return Date.now() - (+sessionStorage.getItem(RELOAD_KEY) || 0) < 20000; } catch(e) { return true; } };
    /* inside the home page frames the parent page syncs; a reload there reloads the frames too */
    if (!EMBED) syncKits().then(info => {
      if (info.activeChanged && !touched && Date.now() - t0 < 2500 && !recentReload()){ try { sessionStorage.setItem(RELOAD_KEY, String(Date.now())); location.reload(); } catch(e) {} }
    });
    else RS.fs.ready.then(refreshFileIds).catch(() => {});
    window.addEventListener("storage", e => { if (e.key === STORE || e.key === ACTIVE){ const ac = kitSig() !== SIG0; if (ac || e.key === STORE) emitSynced({ changed:true, activeChanged:ac }); } });
  }

  const storeKey = base => KIT.id === "girika" ? base : `${base}::${KIT.id}`;

  return Object.freeze({ LOGO, PALETTE, C, TONES, KIT, FONTS, IMG, TEXTLOGO, BUILTIN, FONTS_HEAD, FONTS_BODY, INDUSTRIES, derive, mix, lum, hex2rgb,
    drawImageLogo, imgAspect, drawTextLogo, textAspect, fill, storeKey, readKits, saveKit, deleteKit, setActive, activeId, fontURL,
    saveKitAsync, deleteKitAsync, switchTo, isSlim, fullKit, whereSaved, syncKits, onKitsSynced, kitsStale:() => stale, fontsReady:FONTS_P,
    isFirstRun:() => !activeId(), onReady, industry:KIT.industry || "realestate" });
})();
