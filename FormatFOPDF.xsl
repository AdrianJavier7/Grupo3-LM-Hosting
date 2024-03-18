<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:fo="http://www.w3.org/1999/XSL/Format">
    <xsl:output method="xml" indent="yes"/>

    <xsl:template match="/">
        <fo:root>
            <fo:layout-master-set>
                <fo:simple-page-master master-name="A4" page-width="210mm"
                                       margin-top="20mm" margin-bottom="20mm" margin-left="20mm" margin-right="20mm">
                    <fo:region-body margin-top="20mm" margin-bottom="20mm" margin-left="20mm" margin-right="20mm"/>
                </fo:simple-page-master>
            </fo:layout-master-set>
            <fo:page-sequence master-reference="A4">
                <fo:flow flow-name="xsl-region-body">
                    <fo:block text-align="center" font-family="Garamond" font-size="12pt" font-weight="bold" color="#000000" margin-bottom="20pt">
                        Trabajo para el caso PBL
                        <fo:block/>
                        Sindicación de contenidos con RSS
                        <fo:block/>
                        Lenguajes de Marca y sistemas de gestión de la información
                    </fo:block>
                    <fo:block margin="4mm" font-family="Arial" font-size="18pt" color="#000000" text-align="center" font-weight="bold" text-decoration="underline">
                        <xsl:choose>
                            <xsl:when test="position() = 1">
                                <fo:inline font-family="Arial">
                                    <xsl:value-of select="/rss/channel/title"/>
                                </fo:inline>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="/rss/channel/title"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </fo:block>
                    <xsl:apply-templates select="/rss/channel/item"/>
                    <fo:block font-size="12pt" margin-bottom="5pt" text-align="left">
                        <fo:inline>Componentes del grupo:</fo:inline>
                        <fo:block text-align="center" margin-left="10pt">
                            <xsl:text>Daniel Martín,</xsl:text>
                        </fo:block>
                        <fo:block text-align="center" margin-left="10pt">
                            <xsl:text>Adrián Pérez,</xsl:text>
                        </fo:block>
                        <fo:block text-align="center" margin-left="10pt">
                            <xsl:text>José Carlos,</xsl:text>
                        </fo:block>
                        <fo:block text-align="center" margin-left="10pt">
                            <xsl:text>Alejandro Almansa</xsl:text>
                        </fo:block>
                    </fo:block>
                </fo:flow>
            </fo:page-sequence>
        </fo:root>
    </xsl:template>

    <xsl:template match="item">
        <fo:block margin-bottom="10mm" border="1pt solid #000000" width="15mm" color="#000000">
            <fo:block margin="4mm">
                <fo:external-graphic src="{image}" content-width="50pt" content-height="50pt"/>
            </fo:block>
            <fo:table width="125mm" margin-left="2mm">
                <fo:table-body>
                    <fo:table-row>
                        <fo:table-cell font-family="Trebuchet" font-size="12pt" font-weight="bold">
                            <fo:block>
                                <xsl:value-of select="section"/>
                            </fo:block>
                        </fo:table-cell>
                        <fo:table-cell font-family="Trebuchet" font-size="10pt" font-weight="bold" text-align="right" margin-left="20px">
                            <fo:block>
                                <xsl:value-of select="date"/>
                            </fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                </fo:table-body>
            </fo:table>
            <fo:block margin="4mm" font-family="Garamond" font-size="12pt">
                <fo:inline font-family="Times New Roman" font-size="12pt">
                    <xsl:value-of select="title"/>
                </fo:inline>
                <fo:inline font-family="Verdana" font-size="8pt">
                    <xsl:text> (</xsl:text><xsl:value-of select="author"/><xsl:text>)</xsl:text>
                </fo:inline>
            </fo:block>
            <fo:block margin="4mm" font-size="12pt" font-family="Times New Roman">
                <fo:basic-link color="#000000">
                    <xsl:attribute name="external-destination">
                        <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="link"/>
                </fo:basic-link>
            </fo:block>
        </fo:block>
    </xsl:template>

</xsl:stylesheet>
